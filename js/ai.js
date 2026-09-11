/**
 * ai.js
 * generateAI(type, payload) is the ONLY function the UI calls for anything
 * AI-generated. In LIVE mode it POSTs to /api/ai (a Firebase Cloud Function
 * or any backend you deploy), which holds the Groq API key server-side and
 * never ships it to the browser. In DEMO MODE it returns template-based
 * content instantly, clearly labeled as demo output where it's shown.
 *
 * Supported types: myth, what_if, challenge, secret, mob_battle,
 * test_instructions, result_summary, video_hook, video_titles,
 * thumbnail_text, script, hashtags, addon_keywords
 */

async function generateAI(type, payload) {
  if (!BT_DEMO_MODE) {
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload })
      });
      if (!res.ok) throw new Error("AI backend error");
      return await res.json();
    } catch (err) {
      console.error("[BlockTheory] AI request failed", err);
      throw new Error("AI is temporarily unavailable.");
    }
  }
  await btFakeLatency(500, 1100);
  return demoGenerate(type, payload);
}

function btFakeLatency(min, max) {
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));
}

function demoGenerate(type, payload) {
  const p = payload || {};
  switch (type) {
    case "myth":
      return {
        title: p.query ? capitalize(p.query) : "Can a shulker survive a fall from build height?",
        category: pick(MOCK.categories.myth),
        difficulty: pick(["Easy", "Medium", "Hard"]),
        edition: pick(MOCK.editions),
        version: pick(MOCK.versions),
        status: "UNTESTED"
      };
    case "what_if":
      return {
        title: `WHAT IF ${(p.query || "every mob became tiny").toUpperCase()}?`,
        why: "It flips a rule players treat as fixed, so the results feel genuinely uncertain on camera.",
        affectedMobs: ["Zombies", "Skeletons", "Creepers", "Iron Golems"],
        gameplayChanges: [
          "Smaller hitboxes change ranged accuracy",
          "Combat difficulty shifts in unexpected directions",
          "Pathfinding and AI behave differently at small scale",
          "New survival strategies become viable"
        ],
        experimentIdea: `Test how the change in "${p.query || "the scenario"}" affects a standard survival encounter.`,
        testProcedure: [
          "Set up a superflat creative test world",
          "Apply the scenario condition consistently",
          "Run three separate encounters and record results",
          "Compare against unmodified baseline"
        ],
        videoHook: "I changed one rule of Minecraft, and it broke everything.",
        videoTitle: `I Tested: ${p.query || "What If Every Mob Became Tiny"}`,
        thumbnailText: "ONE RULE. TOTAL CHAOS."
      };
    case "challenge":
      return pick(MOCK.challenges);
    case "secret":
      return pick(MOCK.secrets);
    case "mob_battle": {
      const a = p.mobA || pick(MOCK.mobs);
      const b = p.mobB || pick(MOCK.mobs);
      return {
        mobA: a,
        mobB: b,
        arena: p.arena || pick(MOCK.arenas),
        setup: `${a} and ${b} are placed at opposite ends of the arena with no player interference.`,
        rules: "No player damage. Natural AI only. Best of three rounds.",
        environment: p.arena || pick(MOCK.arenas),
        expectedAdvantage: `${a} likely wins on positioning; ${b} likely wins on raw damage output.`,
        testProcedure: [
          "Spawn both mobs simultaneously",
          "Do not interfere unless a mob leashes",
          "Record the winner and time to resolution",
          "Repeat three times for consistency"
        ]
      };
    }
    case "test_instructions":
      return {
        setup: {
          items: ["Standard survival inventory", "A stopwatch or F3 debug overlay"],
          worldSettings: "Superflat or a fresh survival world, normal difficulty",
          edition: p.edition || "Java",
          version: p.version || "1.21"
        },
        procedure: [
          "Reproduce the exact condition described by the myth",
          "Record the outcome without altering variables mid-test",
          "Repeat at least three times",
          "Note any version-specific behavior"
        ]
      };
    case "result_summary":
      return {
        summary: `Across ${p.attempts || 3} attempts, the result leaned toward ${p.result || "TRUE"} on ${p.version || "the tested version"}.`
      };
    case "video_hook":
      return { hook: "I tested one of Minecraft's weirdest myths, and the result surprised me." };
    case "video_titles":
      return {
        titles: [
          `I Tested: ${p.title || "This Minecraft Myth"}`,
          `${p.title || "This Myth"} Is ${p.result || "TRUE"}? Here's Proof`,
          `Minecraft Myth Busted: ${p.title || "The Full Test"}`
        ]
      };
    case "thumbnail_text":
      return { text: pick(["MYTH BUSTED", "IT'S TRUE?!", "DON'T TRY THIS", "PROVEN"]) };
    case "script":
      return {
        short: `Everyone says ${p.title || "this myth"} is impossible. I tested it myself — here's exactly what happened.`,
        long: `Today we're testing a myth that's been floating around the community: ${p.title || "this scenario"}. I set up a clean test environment, ran it multiple times, and recorded every attempt so you can see the real result, not just a claim.`
      };
    case "hashtags":
      return { tags: ["#Minecraft", "#MinecraftMyths", "#MinecraftChallenge", "#Gaming", "#BlockTheory"] };
    case "addon_keywords":
      return { keywords: deriveKeywords(p.query || "") };
    default:
      return {};
  }
}

function deriveKeywords(query) {
  const q = query.toLowerCase();
  for (const key in AI_KEYWORD_MAP) {
    if (q.includes(key)) return AI_KEYWORD_MAP[key];
  }
  return q
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
