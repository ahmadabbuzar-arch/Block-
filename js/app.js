/**
 * app.js
 * Boots the app, owns the tiny view-state object, renders the shell
 * (sidebar / bottom nav / header) once, and re-renders #view-root on
 * every navigation. All interactive behavior is wired through a single
 * delegated click/submit listener using data-action / data-nav attributes.
 */

const VIEWS = [
  { id: "home", label: "Home", icon: "home" },
  { id: "mythlab", label: "Myth Lab", icon: "flask" },
  { id: "whatif", label: "What If?", icon: "spark" },
  { id: "challenges", label: "Challenges", icon: "flag" },
  { id: "secrets", label: "Secrets", icon: "eye" },
  { id: "mobbattles", label: "Mob Battles", icon: "swords" },
  { id: "addonfinder", label: "Addon Finder", icon: "search" },
  { id: "trending", label: "Trending", icon: "trend" },
  { id: "mytests", label: "My Tests", icon: "check" },
  { id: "saved", label: "Saved", icon: "bookmark" },
  { id: "profile", label: "Profile", icon: "user" },
  { id: "settings", label: "Settings", icon: "gear" }
];

const MOBILE_NAV = ["home", "mythlab", "whatif", "mytests", "profile"];

const state = {
  view: "home",
  mythlab: { category: "All", query: "" },
  whatif: { query: "", scenario: null },
  secrets: { category: "All" },
  mobbattles: {},
  addonfinder: { query: "", edition: "", version: "", searched: false, results: [] },
  saved: { filter: "All" },
  activeTestId: null
};

function icon(name) {
  const icons = {
    home: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z",
    flask: "M9 3h6M10 3v5l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3",
    spark: "M12 3v4M12 17v4M4.5 4.5l3 3M16.5 16.5l3 3M3 12h4M17 12h4M4.5 19.5l3-3M16.5 7.5l3-3",
    flag: "M5 21V4h13l-3 4 3 4H5",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    swords: "M4 20l6-6M20 4l-6 6M6 6l4 4-2 2-4-4zM18 18l-4-4 2-2 4 4z",
    search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.35-4.35",
    trend: "M4 17l5-5 4 4 7-8M20 8h-4M20 8v4",
    check: "M20 6 9 17l-5-5",
    bookmark: "M6 3h12v18l-6-4-6 4z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
    gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2m12 0h2M12 4v2m0 12v2M6.3 6.3l1.4 1.4m8.6 8.6 1.4 1.4M6.3 17.7l1.4-1.4m8.6-8.6 1.4-1.4"
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon">${(icons[name] || "").split(" M").map((d, i) => `<path d="${i === 0 ? d : "M" + d}"/>`).join("")}</svg>`;
}

function renderShell() {
  document.getElementById("sidebar").innerHTML = `
    <div class="sidebar__logo">${logoMark()}<span>BLOCKTHEORY</span></div>
    <nav class="sidebar__nav">
      ${VIEWS.slice(0, 8).map(navItem).join("")}
    </nav>
    <div class="sidebar__divider"></div>
    <nav class="sidebar__nav">
      ${VIEWS.slice(8, 10).map(navItem).join("")}
    </nav>
    <div class="sidebar__divider"></div>
    <nav class="sidebar__nav">
      ${navItem(VIEWS[11])}
    </nav>
    <div class="sidebar__user" data-nav="profile">
      <div class="avatar" id="sidebar-avatar">?</div>
      <div class="sidebar__user-meta">
        <span id="sidebar-username">Sign in</span>
        <span class="sidebar__status"><i class="dot"></i>${BT_DEMO_MODE ? "Demo Mode" : "Online"}</span>
      </div>
    </div>
  `;

  document.getElementById("bottom-nav").innerHTML = MOBILE_NAV.map((id) => {
    const v = VIEWS.find((x) => x.id === id);
    return `<button class="bottom-nav__item ${state.view === id ? "bottom-nav__item--active" : ""}" data-nav="${id}">${icon(v.icon)}<span>${v.label}</span></button>`;
  }).join("");
}

function navItem(v) {
  return `<button class="sidebar__item ${state.view === v.id ? "sidebar__item--active" : ""}" data-nav="${v.id}">${icon(v.icon)}<span>${v.label}</span></button>`;
}

function logoMark() {
  return `<svg viewBox="0 0 32 32" class="logo-mark"><rect x="4" y="4" width="11" height="11" fill="var(--primary)"/><rect x="17" y="4" width="11" height="11" fill="var(--secondary)"/><rect x="4" y="17" width="11" height="11" fill="var(--surface-2)" stroke="var(--border)"/><rect x="17" y="17" width="11" height="11" fill="var(--bg)" stroke="var(--primary)" stroke-width="1.5"/></svg>`;
}

function updateUserChrome() {
  const user = getCurrentUser();
  const avatarEls = [document.getElementById("sidebar-avatar"), document.getElementById("header-avatar")];
  avatarEls.forEach((elx) => elx && (elx.textContent = user ? initials(user.displayName) : "?"));
  const nameEl = document.getElementById("sidebar-username");
  if (nameEl) nameEl.textContent = user ? user.displayName : "Sign in";
}

function navigate(view) {
  state.view = view;
  state.activeTestId = null;
  render();
  document.getElementById("view-root").scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  renderShell();
  updateUserChrome();
  const root = document.getElementById("view-root");
  switch (state.view) {
    case "home": root.innerHTML = renderHome(); break;
    case "mythlab": root.innerHTML = renderMythLab(state.mythlab); break;
    case "testflow": {
      const test = getTestById(state.activeTestId);
      const myth = MOCK.myths.find((m) => m.id === test.mythId) || { title: test.title, edition: test.edition, version: test.version };
      root.innerHTML = renderTestFlow(test, myth);
      break;
    }
    case "whatif": root.innerHTML = renderWhatIf(state.whatif); break;
    case "challenges": root.innerHTML = renderChallenges(); break;
    case "secrets": root.innerHTML = renderSecrets(state.secrets); break;
    case "mobbattles": root.innerHTML = renderMobBattles(state.mobbattles); break;
    case "addonfinder": root.innerHTML = renderAddonFinder(state.addonfinder); break;
    case "trending": root.innerHTML = renderTrending(); break;
    case "mytests": root.innerHTML = renderMyTests(); break;
    case "saved": root.innerHTML = renderSaved(state.saved); break;
    case "profile": root.innerHTML = renderProfile(); break;
    case "settings": root.innerHTML = renderSettings(); break;
    default: root.innerHTML = renderHome();
  }
}

function openTest(mythId) {
  const myth = MOCK.myths.find((m) => m.id === mythId) || { id: mythId, title: "Custom myth", edition: getSettings().defaultEdition, version: getSettings().defaultVersion };
  const test = startTest(myth);
  state.activeTestId = test.id;
  state.view = "testflow";
  render();
}

function continueTest(testId) {
  state.activeTestId = testId;
  state.view = "testflow";
  render();
}

async function withButtonLoading(btn, labelWhileLoading, fn) {
  if (!btn) return fn();
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = labelWhileLoading;
  try {
    return await fn();
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

document.addEventListener("click", async (e) => {
  const navBtn = e.target.closest("[data-nav]");
  if (navBtn) return navigate(navBtn.dataset.nav);

  const chip = e.target.closest("[data-category]");
  if (chip) {
    if (state.view === "mythlab") state.mythlab.category = chip.dataset.category;
    if (state.view === "secrets") state.secrets.category = chip.dataset.category;
    return render();
  }

  const savedChip = e.target.closest("[data-savedfilter]");
  if (savedChip) {
    state.saved.filter = savedChip.dataset.savedfilter;
    return render();
  }

  const actionBtn = e.target.closest("[data-action]");
  if (!actionBtn) return;
  const { action, id, type, result: outcomeResult, title, query } = actionBtn.dataset;

  switch (action) {
    case "test-myth":
      return openTest(id);

    case "test-secret": {
      const secret = MOCK.secrets.find((x) => x.id === id);
      if (!MOCK.myths.find((m) => m.id === secret.id)) {
        MOCK.myths.push({ id: secret.id, title: secret.title, category: secret.category, difficulty: "Medium", edition: secret.edition, version: secret.version, status: secret.status });
      }
      return openTest(secret.id);
    }

    case "save-myth": {
      const m = MOCK.myths.find((x) => x.id === id);
      if (isSaved(id, "myth")) removeSavedItem(id, "myth");
      else saveItem({ id, type: "myth", title: m.title });
      return render();
    }
    case "save-challenge": {
      const c = MOCK.challenges.find((x) => x.id === id);
      if (isSaved(id, "challenge")) removeSavedItem(id, "challenge");
      else saveItem({ id, type: "challenge", title: c.title });
      return render();
    }
    case "save-secret": {
      const s = MOCK.secrets.find((x) => x.id === id);
      if (isSaved(id, "secret")) removeSavedItem(id, "secret");
      else saveItem({ id, type: "secret", title: s.title });
      return render();
    }
    case "save-addon": {
      const a = MOCK.addons.find((x) => x.id === id);
      if (isSaved(id, "addon")) removeSavedItem(id, "addon");
      else saveItem({ id, type: "addon", title: a.name });
      return render();
    }
    case "save-whatif":
      saveItem({ id: `wi_${Date.now()}`, type: "whatif", title });
      toast("Scenario saved.");
      return render();
    case "unsave":
      removeSavedItem(id, type);
      return render();

    case "share":
      toast(`Share link copied for "${title}" (demo).`);
      return;

    case "start-challenge":
      toast("Challenge started — good luck!");
      return;

    case "test-next": {
      const test = getTestById(id);
      test.step += 1;
      upsertTest(test);
      return render();
    }
    case "record-attempt": {
      const outcome = document.getElementById("attempt-outcome").value;
      const notes = document.getElementById("attempt-notes").value;
      const fileInput = document.getElementById("attempt-screenshot");
      const file = fileInput.files[0];
      await withButtonLoading(actionBtn, "Uploading...", async () => {
        try {
          const screenshotURL = file ? await uploadScreenshot(file, id) : null;
          recordAttempt(id, { outcome, notes, screenshotURL });
          toast("Attempt recorded.");
        } catch (err) {
          toast(err.message || "Couldn't save screenshot.", "error");
          recordAttempt(id, { outcome, notes, screenshotURL: null });
        }
        render();
      });
      return;
    }
    case "finalize-result": {
      const test = getTestById(id);
      const notes = test.attempts.map((a) => a.notes).filter(Boolean).join(" ");
      finalizeResult(id, outcomeResult, notes);
      return render();
    }
    case "continue-test":
      return continueTest(id);

    case "publish-test":
      publishTest(id);
      toast("Result published to the community.");
      return render();

    case "video-pack":
      return openVideoPackModal(id);

    case "find-addons":
      state.addonfinder = { query, edition: "", version: "", searched: false, results: [] };
      navigate("addonfinder");
      return searchAddonsFromState(actionBtn);

    case "retry-addon-search":
      state.addonfinder.searched = false;
      return render();

    case "like-result":
      likeResult(id);
      return render();

    default:
      return;
  }
});

async function searchAddonsFromState(triggerBtn) {
  await withButtonLoading(triggerBtn, "Finding addons...", async () => {
    try {
      const results = await searchAddons(state.addonfinder.query, state.addonfinder.edition, state.addonfinder.version);
      state.addonfinder.results = results;
      state.addonfinder.searched = true;
    } catch (err) {
      toast(err.message || "Couldn't load addons.", "error");
    }
    render();
  });
}

document.addEventListener("submit", (e) => e.preventDefault());

document.addEventListener("click", async (e) => {
  if (e.target.id === "generate-myth-btn") {
    const query = document.getElementById("myth-input").value.trim();
    await withButtonLoading(e.target, "Generating myth...", async () => {
      const myth = await generateAI("myth", { query });
      myth.id = `m_${Date.now()}`;
      MOCK.myths.unshift(myth);
      state.mythlab.query = "";
      render();
      toast("Myth generated.");
    });
  }

  if (e.target.id === "generate-whatif-btn") {
    const query = document.getElementById("whatif-input").value.trim();
    if (!query) return toast("Describe a rule change first.", "error");
    await withButtonLoading(e.target, "Generating scenario...", async () => {
      state.whatif.query = query;
      state.whatif.scenario = await generateAI("what_if", { query });
      render();
    });
  }

  if (e.target.id === "search-addons-btn") {
    state.addonfinder.query = document.getElementById("addon-input").value.trim();
    state.addonfinder.edition = document.getElementById("addon-edition").value;
    state.addonfinder.version = document.getElementById("addon-version").value;
    if (!state.addonfinder.query) return toast("Enter a search term first.", "error");
    return searchAddonsFromState(e.target);
  }

  if (e.target.id === "generate-battle-btn") {
    const mobA = document.getElementById("mob-a").value;
    const mobB = document.getElementById("mob-b").value;
    const arena = document.getElementById("mob-arena").value;
    await withButtonLoading(e.target, "Generating battle...", async () => {
      state.mobbattles = { mobA, mobB, arena, battle: await generateAI("mob_battle", { mobA, mobB, arena }) };
      render();
    });
  }

  if (e.target.id === "signin-btn") {
    await signIn();
    toast(`Welcome, ${getCurrentUser().displayName}.`);
    render();
  }

  if (e.target.id === "signout-btn") {
    await signOutUser();
    render();
  }

  if (e.target.id === "save-settings-btn") {
    updateSettings({
      defaultEdition: document.getElementById("set-edition").value,
      defaultVersion: document.getElementById("set-version").value,
      aiTone: document.getElementById("set-tone").value,
      notifications: document.getElementById("set-notifications").checked,
      privacyPublicResults: document.getElementById("set-privacy").checked
    });
    toast("Settings saved.");
  }
});

/* ---------------- Video pack modal ---------------- */

async function openVideoPackModal(testId) {
  const test = getTestById(testId);
  const modalRoot = document.getElementById("modal-root");
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><div class="modal__loading">${skeletonCards(1)}<p>Generating video pack...</p></div></div></div>`;
  modalRoot.classList.add("modal-root--open");

  try {
    const [hook, titles, thumb, script, tags] = await Promise.all([
      generateAI("video_hook", { title: test.title }),
      generateAI("video_titles", { title: test.title, result: test.result }),
      generateAI("thumbnail_text", { title: test.title }),
      generateAI("script", { title: test.title }),
      generateAI("hashtags", {})
    ]);
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-close-modal>
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal__header">
            <h2>Video pack</h2>
            <button class="btn btn--icon" data-close-modal aria-label="Close">✕</button>
          </div>
          <div class="modal__body">
            <h4>Hook</h4><p>${escapeHtml(hook.hook)}</p>
            <h4>Title options</h4><ul class="numbered-list">${titles.titles.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
            <h4>Thumbnail text</h4><p class="pill pill--reward">${escapeHtml(thumb.text)}</p>
            <h4>Short-form script</h4><p>${escapeHtml(script.short)}</p>
            <h4>Long-form script</h4><p>${escapeHtml(script.long)}</p>
            <h4>Hashtags</h4><p>${tags.tags.join(" ")}</p>
          </div>
        </div>
      </div>`;
  } catch (err) {
    modalRoot.innerHTML = `<div class="modal-backdrop" data-close-modal><div class="modal"><p>AI is temporarily unavailable.</p></div></div>`;
  }
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-modal]") === e.target || e.target.dataset.closeModal !== undefined) {
    if (e.target.matches(".modal-backdrop, [data-close-modal]")) {
      document.getElementById("modal-root").classList.remove("modal-root--open");
      document.getElementById("modal-root").innerHTML = "";
    }
  }
});

/* ---------------- Global search ---------------- */

function wireHeaderSearch() {
  const input = document.getElementById("global-search");
  const results = document.getElementById("search-results");
  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (!q) return (results.classList.remove("search-results--open"), (results.innerHTML = ""));
    const grouped = globalSearch(q);
    const groups = Object.entries(grouped).filter(([, arr]) => arr.length);
    if (!groups.length) {
      results.innerHTML = `<div class="search-results__empty">No matches for "${escapeHtml(q)}"</div>`;
    } else {
      results.innerHTML = groups.map(([label, items]) => `
        <div class="search-results__group">
          <span class="search-results__label">${label}</span>
          ${items.slice(0, 4).map((i) => `<button class="search-results__item" data-nav="${label === "addons" ? "addonfinder" : label === "myths" ? "mythlab" : label === "challenges" ? "challenges" : "secrets"}">${escapeHtml(i.title || i.name)}</button>`).join("")}
        </div>`).join("");
    }
    results.classList.add("search-results--open");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-search")) {
      results.classList.remove("search-results--open");
    }
  });
}

/* ---------------- Boot ---------------- */

function wireMobileDrawer() {
  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("sidebar-scrim");
  const openDrawer = () => { sidebar.classList.add("sidebar--open"); scrim.classList.add("sidebar-scrim--visible"); };
  const closeDrawer = () => { sidebar.classList.remove("sidebar--open"); scrim.classList.remove("sidebar-scrim--visible"); };
  document.getElementById("hamburger-btn").addEventListener("click", openDrawer);
  scrim.addEventListener("click", closeDrawer);
  sidebar.addEventListener("click", (e) => { if (e.target.closest("[data-nav]")) closeDrawer(); });
}

function boot() {
  initFirebase();
  onAuthChange(() => updateUserChrome());
  restoreSession();
  wireHeaderSearch();
  wireMobileDrawer();
  render();
  if (BT_DEMO_MODE) {
    document.getElementById("demo-badge").classList.add("demo-badge--visible");
  }
}

document.addEventListener("DOMContentLoaded", boot);
