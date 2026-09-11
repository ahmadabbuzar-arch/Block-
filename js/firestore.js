/**
 * firestore.js
 * Every read/write in the app goes through these functions so the UI
 * never touches Firestore or localStorage directly. Swapping demo mode
 * for a live backend means only this file's internals change.
 */

const LS_PREFIX = "bt_";

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
}

/** ---- Saved items (myths, experiments, what-ifs, challenges, addons, results) ---- */

function getSavedItems() {
  return lsGet("saved", []);
}

function saveItem(item) {
  const items = getSavedItems();
  if (items.find((i) => i.id === item.id && i.type === item.type)) return items;
  items.unshift({ ...item, savedAt: Date.now() });
  lsSet("saved", items);
  return items;
}

function removeSavedItem(id, type) {
  const items = getSavedItems().filter((i) => !(i.id === id && i.type === type));
  lsSet("saved", items);
  return items;
}

function isSaved(id, type) {
  return getSavedItems().some((i) => i.id === id && i.type === type);
}

/** ---- My Tests (personal experiment attempts) ---- */

function getMyTests() {
  return lsGet("tests", []);
}

function upsertTest(test) {
  const tests = getMyTests();
  const idx = tests.findIndex((t) => t.id === test.id);
  if (idx >= 0) tests[idx] = test;
  else tests.unshift(test);
  lsSet("tests", tests);
  return tests;
}

function getTestById(id) {
  return getMyTests().find((t) => t.id === id) || null;
}

/** ---- Community results (published tests) ---- */

function getCommunityResults() {
  return lsGet("community", []);
}

function publishResult(result) {
  const results = getCommunityResults();
  results.unshift({ ...result, likes: 0, id: result.id || `r_${Date.now()}` });
  lsSet("community", results);
  return results;
}

function likeResult(id) {
  const results = getCommunityResults();
  const likedIds = lsGet("liked", []);
  if (likedIds.includes(id)) return results;
  const r = results.find((x) => x.id === id);
  if (r) r.likes += 1;
  lsSet("community", results);
  lsSet("liked", [...likedIds, id]);
  return results;
}

/** ---- Settings ---- */

function getSettings() {
  return lsGet("settings", {
    theme: "dark",
    defaultEdition: "Java",
    defaultVersion: "1.21",
    aiTone: "energetic",
    notifications: true,
    privacyPublicResults: true
  });
}

function updateSettings(patch) {
  const next = { ...getSettings(), ...patch };
  lsSet("settings", next);
  return next;
}
