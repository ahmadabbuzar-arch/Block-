/**
 * functions/index.js
 *
 * Example Firebase Cloud Functions backend for BlockTheory.
 * Deploy this (or an equivalent serverless function on your platform
 * of choice) to give the frontend's generateAI()/searchAddons() calls
 * something real to talk to. The Groq API key lives ONLY here, as a
 * Firebase Functions secret/environment variable — never in frontend
 * code, HTML, or the public Firebase config.
 *
 * Setup:
 *   firebase functions:secrets:set GROQ_API_KEY
 *   firebase deploy --only functions
 *
 * Frontend calls:
 *   POST /api/ai        { type, payload }   -> JSON matching ai.js's demoGenerate() shapes
 *   GET  /api/addons     ?q=&edition=&version= -> array shaped like mock-data.js's addons
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const PROMPTS = {
  myth: (p) => `Generate a Minecraft myth to test based on: "${p.query}". Return JSON with title, category, difficulty, edition, version, status ("UNTESTED").`,
  what_if: (p) => `Generate a Minecraft "What If" scenario for: "${p.query}". Return JSON with title, why, affectedMobs (array), gameplayChanges (array), experimentIdea, testProcedure (array), videoHook, videoTitle, thumbnailText.`,
  mob_battle: (p) => `Generate a fictional in-game Minecraft mob battle between ${p.mobA} and ${p.mobB} in ${p.arena}. Return JSON with setup, rules, environment, expectedAdvantage, testProcedure (array).`,
  video_hook: (p) => `Write one short, punchy video hook for a Minecraft myth-testing video about: "${p.title}". Return JSON with hook.`,
  video_titles: (p) => `Write 3 distinct YouTube title options for a video about testing "${p.title}" with result ${p.result}. Return JSON with titles (array of 3).`,
  thumbnail_text: (p) => `Write 3-5 words of thumbnail text for a Minecraft myth video about "${p.title}". Return JSON with text.`,
  script: (p) => `Write a short-form and long-form video script opener for a Minecraft myth test about "${p.title}". Return JSON with short, long.`,
  hashtags: () => `Generate 5 relevant hashtags for a Minecraft myth-testing video. Return JSON with tags (array).`,
  addon_keywords: (p) => `Convert this Minecraft scenario into 5 short addon-search keywords: "${p.query}". Return JSON with keywords (array).`
};

exports.api = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  const path = req.path.replace(/^\/+/, "");

  if (path === "ai" && req.method === "POST") {
    return handleAI(req, res);
  }
  if (path === "addons" && req.method === "GET") {
    return handleAddons(req, res);
  }
  return res.status(404).json({ error: "Not found" });
});

async function handleAI(req, res) {
  const { type, payload } = req.body || {};
  const buildPrompt = PROMPTS[type];
  if (!buildPrompt) return res.status(400).json({ error: "Unsupported AI type" });

  try {
    const apiKey = process.env.GROQ_API_KEY || functions.config().groq?.key;
    const groqRes = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You only output valid JSON matching the exact fields requested. No markdown, no commentary." },
          { role: "user", content: buildPrompt(payload || {}) }
        ]
      })
    });
    if (!groqRes.ok) throw new Error(`Groq error ${groqRes.status}`);
    const data = await groqRes.json();
    const content = JSON.parse(data.choices[0].message.content);
    return res.status(200).json(content);
  } catch (err) {
    console.error("AI generation failed:", err);
    return res.status(502).json({ error: "AI is temporarily unavailable." });
  }
}

async function handleAddons(req, res) {
  const { q, edition, version } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });

  try {
    // Wire this up to whatever addon sources you're permitted to query
    // (Modrinth's public API, CurseForge's API with a key, etc). Never
    // fabricate a result — return [] when nothing real is found.
    // Example shape expected by the frontend (addons.js / ui.js):
    // { id, name, creator, edition, versions: [], description, source, url }
    const results = [];
    return res.status(200).json(results);
  } catch (err) {
    console.error("Addon search failed:", err);
    return res.status(502).json({ error: "Couldn't load addons." });
  }
}
