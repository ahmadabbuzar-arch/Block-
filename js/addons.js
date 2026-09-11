/**
 * addons.js
 * searchAddons(query, edition, version) is the ONLY function the UI calls
 * for addon discovery. It NEVER invents a result: if no source returns a
 * match, it returns an empty array and the UI shows "No matching addon
 * found." Real integrations (Modrinth, CurseForge, MCPEDL-permitted feeds)
 * should be added inside the `if (!BT_DEMO_MODE)` branch below, each
 * returning objects shaped like the demo entries in mock-data.js.
 */

async function searchAddons(query, edition, version) {
  if (!BT_DEMO_MODE) {
    try {
      const res = await fetch(
        `/api/addons?q=${encodeURIComponent(query)}&edition=${encodeURIComponent(edition || "")}&version=${encodeURIComponent(version || "")}`
      );
      if (!res.ok) throw new Error("Addon search failed");
      return await res.json();
    } catch (err) {
      console.error("[BlockTheory] Addon search failed", err);
      throw new Error("Couldn't load addons.");
    }
  }

  await new Promise((r) => setTimeout(r, 400));
  const keywords = deriveKeywords(query);
  const q = query.toLowerCase();

  return MOCK.addons.filter((addon) => {
    const editionMatch = !edition || addon.edition === edition;
    const versionMatch = !version || addon.versions.includes(version);
    const textMatch =
      addon.name.toLowerCase().includes(q) ||
      addon.description.toLowerCase().includes(q) ||
      keywords.some((k) => addon.name.toLowerCase().includes(k) || addon.description.toLowerCase().includes(k));
    return editionMatch && versionMatch && (textMatch || keywords.length === 0);
  });
}
