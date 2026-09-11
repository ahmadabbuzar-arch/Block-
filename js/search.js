/**
 * search.js
 * Global search across local demo content. In live mode this would
 * additionally query Firestore collections; the grouping shape returned
 * here is what ui.js expects either way.
 */

function globalSearch(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return { myths: [], challenges: [], secrets: [], addons: [] };

  return {
    myths: MOCK.myths.filter((m) => m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)),
    challenges: MOCK.challenges.filter((c) => c.title.toLowerCase().includes(q)),
    secrets: MOCK.secrets.filter((s) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)),
    addons: MOCK.addons.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
  };
}
