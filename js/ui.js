/**
 * ui.js
 * Pure(ish) rendering helpers. Each render* function returns an HTML
 * string for a view; app.js swaps it into #view-root and wires events.
 * State mutation always goes through firestore.js / experiments.js —
 * this file only reads and displays.
 */

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function toast(message, kind = "info") {
  const host = document.getElementById("toast-host");
  const node = el(`<div class="toast toast--${kind}">${escapeHtml(message)}</div>`);
  host.appendChild(node);
  requestAnimationFrame(() => node.classList.add("toast--in"));
  setTimeout(() => {
    node.classList.remove("toast--in");
    setTimeout(() => node.remove(), 220);
  }, 3200);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function statusPillClass(status) {
  const map = {
    TRUE: "pill--true",
    FALSE: "pill--false",
    "VERSION DEPENDENT": "pill--version",
    INCONCLUSIVE: "pill--inconclusive",
    UNTESTED: "pill--untested"
  };
  return map[status] || "pill--untested";
}

function skeletonCards(n = 3) {
  return `<div class="grid">${Array.from({ length: n }).map(() => `<div class="card skeleton"></div>`).join("")}</div>`;
}

/* ---------------- Home ---------------- */

function renderHome() {
  const tests = getMyTests();
  const saved = getSavedItems();
  const stats = {
    mythsTested: tests.filter((t) => t.status === "Completed").length + 128,
    experiments: tests.length + 46,
    creators: 3120,
    discoveries: MOCK.secrets.length + 214
  };
  const todaysMyth = MOCK.myths[0];
  const trendingExp = MOCK.trending[0];
  const randomWhatIf = "What if every mob became tiny?";
  const dailyChallenge = MOCK.challenges[0];

  return `
    <section class="hero">
      <div class="hero__brand">BLOCKTHEORY</div>
      <h1 class="hero__headline">Test Minecraft.<br>Discover the impossible.</h1>
      <p class="hero__sub">Find myths, build experiments, discover addons, and turn your results into content.</p>
      <div class="hero__actions">
        <button class="btn btn--primary" data-nav="mythlab">Start an experiment</button>
        <button class="btn btn--ghost" data-nav="whatif">Explore what if?</button>
      </div>
    </section>

    <section class="stat-row">
      <div class="stat"><span class="stat__value">${stats.mythsTested}</span><span class="stat__label">Myths tested</span></div>
      <div class="stat"><span class="stat__value">${stats.experiments}</span><span class="stat__label">Experiments</span></div>
      <div class="stat"><span class="stat__value">${stats.creators.toLocaleString()}</span><span class="stat__label">Creators</span></div>
      <div class="stat"><span class="stat__value">${stats.discoveries}</span><span class="stat__label">Discoveries</span></div>
    </section>

    <section class="grid grid--4up">
      <div class="card feature-card">
        <span class="card__eyebrow">Today's myth</span>
        <h3>${escapeHtml(todaysMyth.title)}</h3>
        <span class="meta">${todaysMyth.edition} • ${todaysMyth.version}</span>
        <button class="btn btn--small btn--primary" data-action="test-myth" data-id="${todaysMyth.id}">Test it</button>
      </div>
      <div class="card feature-card">
        <span class="card__eyebrow">Trending experiment</span>
        <h3>${escapeHtml(trendingExp.title)}</h3>
        <span class="meta">${trendingExp.tests} tests • ${trendingExp.likes} likes</span>
        <button class="btn btn--small btn--ghost" data-nav="trending">View trending</button>
      </div>
      <div class="card feature-card">
        <span class="card__eyebrow">Random what if?</span>
        <h3>${escapeHtml(randomWhatIf)}</h3>
        <span class="meta">AI-generated scenario</span>
        <button class="btn btn--small btn--ghost" data-nav="whatif">Generate</button>
      </div>
      <div class="card feature-card">
        <span class="card__eyebrow">Daily challenge</span>
        <h3>${escapeHtml(dailyChallenge.title)}</h3>
        <span class="meta">${dailyChallenge.difficulty} • ${dailyChallenge.time}</span>
        <button class="btn btn--small btn--ghost" data-nav="challenges">View challenges</button>
      </div>
    </section>

    <section class="section-block">
      <h2>Trending now</h2>
      <div class="grid grid--3up">
        ${MOCK.trending.slice(0, 3).map(trendingCard).join("")}
      </div>
    </section>

    <section class="section-block">
      <h2>Popular with creators</h2>
      <div class="grid grid--3up">
        ${MOCK.myths.slice(0, 3).map(mythCard).join("")}
      </div>
    </section>
  `;
}

function trendingCard(t) {
  return `
    <div class="card">
      <span class="card__eyebrow">Trending experiment</span>
      <h3>${escapeHtml(t.title)}</h3>
      <div class="metric-row">
        <span>${t.views.toLocaleString()} views</span>
        <span>${t.tests} tests</span>
        <span>${t.likes} likes</span>
      </div>
    </div>`;
}

/* ---------------- Myth Lab ---------------- */

function renderMythLab(state) {
  const category = state.category || "All";
  const filtered = category === "All" ? MOCK.myths : MOCK.myths.filter((m) => m.category === category);

  return `
    <div class="page-header">
      <div>
        <h1>Myth Lab</h1>
        <p class="page-sub">Find it. Test it. Prove it.</p>
      </div>
    </div>

    <div class="generate-bar">
      <input type="text" id="myth-input" placeholder="Enter a Minecraft myth..." value="${escapeHtml(state.query || "")}">
      <button class="btn btn--primary" id="generate-myth-btn">Generate myth</button>
    </div>

    <div class="chip-row">
      ${["All", ...MOCK.categories.myth].map((c) => `<button class="chip ${c === category ? "chip--active" : ""}" data-category="${c}">${c}</button>`).join("")}
    </div>

    <div id="myth-grid" class="grid grid--3up">
      ${filtered.map(mythCard).join("") || `<p class="empty-state">No myths in this category yet.</p>`}
    </div>
  `;
}

function mythCard(m) {
  const saved = isSaved(m.id, "myth");
  return `
    <div class="card">
      <span class="card__eyebrow">${escapeHtml(m.category)}</span>
      <h3>${escapeHtml(m.title)}</h3>
      <div class="meta-row">
        <span class="pill ${statusPillClass(m.status)}">${m.status}</span>
        <span class="meta">${m.difficulty}</span>
        <span class="meta">${m.edition} • ${m.version}</span>
      </div>
      <div class="card__actions">
        <button class="btn btn--small btn--primary" data-action="test-myth" data-id="${m.id}">Test it</button>
        <button class="btn btn--small btn--ghost" data-action="save-myth" data-id="${m.id}">${saved ? "Saved" : "Save"}</button>
        <button class="btn btn--small btn--icon" data-action="share" data-title="${escapeHtml(m.title)}" aria-label="Share">Share</button>
      </div>
    </div>`;
}

/* ---------------- Test It flow ---------------- */

function renderTestFlow(test, myth) {
  const step = test.step;
  return `
    <div class="page-header">
      <div>
        <h1>${escapeHtml(myth.title)}</h1>
        <p class="page-sub">${myth.edition} • ${myth.version}</p>
      </div>
      <button class="btn btn--ghost" data-nav="mythlab">Back to Myth Lab</button>
    </div>

    <div class="stepper">
      ${["Setup", "Procedure", "Test", "Result"].map((label, i) => `
        <div class="stepper__item ${step === i + 1 ? "stepper__item--active" : ""} ${step > i + 1 ? "stepper__item--done" : ""}">
          <span class="stepper__dot"></span><span>${label}</span>
        </div>`).join("")}
    </div>

    <div class="card test-panel">
      ${step === 1 ? renderTestSetup(test, myth) : ""}
      ${step === 2 ? renderTestProcedure(test, myth) : ""}
      ${step === 3 ? renderTestRecord(test) : ""}
      ${step === 4 ? renderTestResult(test) : ""}
    </div>
  `;
}

function renderTestSetup(test, myth) {
  return `
    <h2>Setup</h2>
    <ul class="fact-list">
      <li><span>Required items</span><span>Standard survival inventory, stopwatch or F3 overlay</span></li>
      <li><span>World settings</span><span>Superflat or fresh survival world, normal difficulty</span></li>
      <li><span>Edition</span><span>${myth.edition}</span></li>
      <li><span>Version</span><span>${myth.version}</span></li>
    </ul>
    <button class="btn btn--primary" data-action="test-next" data-id="${test.id}">Continue to procedure</button>
  `;
}

function renderTestProcedure(test) {
  return `
    <h2>Procedure</h2>
    <ol class="numbered-list">
      <li>Reproduce the exact condition described by the myth.</li>
      <li>Record the outcome without altering variables mid-test.</li>
      <li>Repeat at least three times for consistency.</li>
      <li>Note any version-specific behavior you observe.</li>
    </ol>
    <button class="btn btn--primary" data-action="test-next" data-id="${test.id}">Continue to test</button>
  `;
}

function renderTestRecord(test) {
  return `
    <h2>Test</h2>
    <p class="page-sub">Attempts recorded: ${test.attempts.length}</p>
    ${test.attempts.length ? `<div class="attempt-list">${test.attempts.map(attemptRow).join("")}</div>` : ""}
    <div class="form-row">
      <label>Result of this attempt
        <select id="attempt-outcome">
          <option>Confirmed</option>
          <option>Did not occur</option>
          <option>Unclear</option>
        </select>
      </label>
      <label>Notes
        <textarea id="attempt-notes" placeholder="What happened?"></textarea>
      </label>
      <label class="file-label">Screenshot (optional, max 5MB)
        <input type="file" id="attempt-screenshot" accept="image/*">
      </label>
    </div>
    <div class="card__actions">
      <button class="btn btn--ghost" data-action="record-attempt" data-id="${test.id}">Record attempt</button>
      <button class="btn btn--primary" data-action="test-next" data-id="${test.id}">Continue to result</button>
    </div>
  `;
}

function attemptRow(a) {
  return `
    <div class="attempt-row">
      ${a.screenshotURL ? `<img class="attempt-row__thumb" src="${a.screenshotURL}" alt="Attempt screenshot">` : `<div class="attempt-row__thumb attempt-row__thumb--empty"></div>`}
      <div class="attempt-row__body">
        <span class="pill pill--untested">${escapeHtml(a.outcome)}</span>
        <p class="meta">${escapeHtml(a.notes || "No notes")}</p>
      </div>
    </div>`;
}

function renderTestResult(test) {
  if (test.result) {
    return `
      <h2>Your result</h2>
      <ul class="fact-list">
        <li><span>Attempts</span><span>${test.attempts.length}</span></li>
        <li><span>Result</span><span class="pill ${statusPillClass(test.result)}">${test.result}</span></li>
        <li><span>Notes</span><span>${escapeHtml(test.notes || "—")}</span></li>
        <li><span>Version</span><span>${test.version}</span></li>
      </ul>
      <div class="card__actions">
        <button class="btn btn--primary" data-action="video-pack" data-id="${test.id}">Generate video pack</button>
        ${!test.published ? `<button class="btn btn--ghost" data-action="publish-test" data-id="${test.id}">Publish result</button>` : `<span class="meta">Published</span>`}
      </div>
    `;
  }
  return `
    <h2>Choose a result</h2>
    <div class="result-choice">
      ${["TRUE", "FALSE", "VERSION DEPENDENT", "INCONCLUSIVE"].map((r) => `<button class="btn btn--ghost result-choice__btn" data-action="finalize-result" data-id="${test.id}" data-result="${r}">${r}</button>`).join("")}
    </div>
  `;
}

/* ---------------- What If ---------------- */

function renderWhatIf(state) {
  const scenario = state.scenario;
  return `
    <div class="page-header">
      <div>
        <h1>What If?</h1>
        <p class="page-sub">Change one rule of Minecraft.</p>
      </div>
    </div>
    <div class="generate-bar">
      <input type="text" id="whatif-input" placeholder="What if every mob became tiny?" value="${escapeHtml(state.query || "")}">
      <button class="btn btn--primary" id="generate-whatif-btn">Generate scenario</button>
    </div>
    <div id="whatif-result">
      ${scenario ? renderWhatIfResult(scenario) : `<p class="empty-state">Describe a rule change to generate a scenario.</p>`}
    </div>
  `;
}

function renderWhatIfResult(s) {
  return `
    <div class="card">
      <h2>${escapeHtml(s.title)}</h2>
      <p>${escapeHtml(s.why)}</p>
      <h4>Affected mobs</h4>
      <div class="chip-row chip-row--static">${s.affectedMobs.map((m) => `<span class="chip">${escapeHtml(m)}</span>`).join("")}</div>
      <h4>Possible gameplay changes</h4>
      <ul class="numbered-list">${s.gameplayChanges.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>
      <h4>Experiment idea</h4>
      <p>${escapeHtml(s.experimentIdea)}</p>
      <h4>Test procedure</h4>
      <ol class="numbered-list">${s.testProcedure.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ol>
      <div class="card__actions">
        <button class="btn btn--primary" data-action="find-addons" data-query="${escapeHtml(s.title)}">Find related addons</button>
        <button class="btn btn--ghost" data-action="save-whatif" data-title="${escapeHtml(s.title)}">Save scenario</button>
      </div>
    </div>
  `;
}

/* ---------------- Challenges ---------------- */

function renderChallenges() {
  return `
    <div class="page-header"><div><h1>Challenges</h1><p class="page-sub">In-game tests of skill, all within Minecraft.</p></div></div>
    <div class="grid grid--3up">${MOCK.challenges.map(challengeCard).join("")}</div>
  `;
}

function challengeCard(c) {
  const saved = isSaved(c.id, "challenge");
  return `
    <div class="card">
      <span class="card__eyebrow">${c.difficulty} • ${c.time}</span>
      <h3>${escapeHtml(c.title)}</h3>
      <p class="meta">${escapeHtml(c.rules)}</p>
      <div class="meta-row"><span class="pill pill--reward">${c.reward}</span></div>
      <div class="card__actions">
        <button class="btn btn--small btn--primary" data-action="start-challenge" data-id="${c.id}">Start challenge</button>
        <button class="btn btn--small btn--ghost" data-action="save-challenge" data-id="${c.id}">${saved ? "Saved" : "Save"}</button>
      </div>
    </div>`;
}

/* ---------------- Secrets ---------------- */

function renderSecrets(state) {
  const category = state.category || "All";
  const filtered = category === "All" ? MOCK.secrets : MOCK.secrets.filter((s) => s.category === category);
  return `
    <div class="page-header"><div><h1>Secrets</h1><p class="page-sub">Discoveries most players never notice.</p></div></div>
    <div class="chip-row">${["All", ...MOCK.categories.secret].map((c) => `<button class="chip ${c === category ? "chip--active" : ""}" data-category="${c}">${c}</button>`).join("")}</div>
    <div class="grid grid--3up">${filtered.map(secretCard).join("")}</div>
  `;
}

function secretCard(s) {
  const saved = isSaved(s.id, "secret");
  return `
    <div class="card">
      <span class="card__eyebrow">${escapeHtml(s.category)} • ${s.level}</span>
      <h3>${escapeHtml(s.title)}</h3>
      <div class="meta-row">
        <span class="pill ${statusPillClass(s.status)}">${s.status}</span>
        <span class="meta">${s.edition} • ${s.version}</span>
      </div>
      <div class="card__actions">
        <button class="btn btn--small btn--primary" data-action="test-secret" data-id="${s.id}">Test</button>
        <button class="btn btn--small btn--ghost" data-action="save-secret" data-id="${s.id}">${saved ? "Saved" : "Save"}</button>
      </div>
    </div>`;
}

/* ---------------- Mob Battles ---------------- */

function renderMobBattles(state) {
  const battle = state.battle;
  return `
    <div class="page-header"><div><h1>Mob Battles</h1><p class="page-sub">Fictional, in-game combat experiments.</p></div></div>
    <div class="card">
      <div class="battle-picker">
        <select id="mob-a">${MOCK.mobs.map((m) => `<option ${state.mobA === m ? "selected" : ""}>${m}</option>`).join("")}</select>
        <span class="battle-vs">VS</span>
        <select id="mob-b">${MOCK.mobs.map((m, i) => `<option ${state.mobB === m || (!state.mobB && i === 1) ? "selected" : ""}>${m}</option>`).join("")}</select>
      </div>
      <label>Arena
        <select id="mob-arena">${MOCK.arenas.map((a) => `<option ${state.arena === a ? "selected" : ""}>${a}</option>`).join("")}</select>
      </label>
      <button class="btn btn--primary" id="generate-battle-btn">Generate battle</button>
    </div>
    <div id="battle-result">${battle ? renderBattleResult(battle) : ""}</div>
  `;
}

function renderBattleResult(b) {
  return `
    <div class="card">
      <h2>${escapeHtml(b.mobA)} <span class="battle-vs">VS</span> ${escapeHtml(b.mobB)}</h2>
      <p class="meta">${escapeHtml(b.environment)}</p>
      <ul class="fact-list">
        <li><span>Setup</span><span>${escapeHtml(b.setup)}</span></li>
        <li><span>Rules</span><span>${escapeHtml(b.rules)}</span></li>
        <li><span>Expected advantage</span><span>${escapeHtml(b.expectedAdvantage)}</span></li>
      </ul>
      <h4>Test procedure</h4>
      <ol class="numbered-list">${b.testProcedure.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
    </div>`;
}

/* ---------------- Addon Finder ---------------- */

function renderAddonFinder(state) {
  return `
    <div class="page-header"><div><h1>Addon Finder</h1><p class="page-sub">Discover existing addons — never redistributed, always linked to the source.</p></div></div>
    <div class="generate-bar">
      <input type="text" id="addon-input" placeholder="What If every mob became tiny?" value="${escapeHtml(state.query || "")}">
      <select id="addon-edition"><option value="">Any edition</option>${MOCK.editions.map((e) => `<option ${state.edition === e ? "selected" : ""}>${e}</option>`).join("")}</select>
      <select id="addon-version"><option value="">Any version</option>${MOCK.versions.map((v) => `<option ${state.version === v ? "selected" : ""}>${v}</option>`).join("")}</select>
      <button class="btn btn--primary" id="search-addons-btn">Search</button>
    </div>
    <div id="addon-results">
      ${state.searched ? renderAddonResults(state.results) : `<p class="empty-state">Enter a myth, scenario, or keyword to search addon sources.</p>`}
    </div>
  `;
}

function renderAddonResults(results) {
  if (!results || results.length === 0) {
    return `<div class="empty-state"><p>No matching addon found.</p><button class="btn btn--ghost" data-action="retry-addon-search">Try another search</button></div>`;
  }
  return `<div class="grid grid--3up">${results.map(addonCard).join("")}</div>`;
}

function addonCard(a) {
  const saved = isSaved(a.id, "addon");
  return `
    <div class="card">
      <span class="card__eyebrow">${a.source}</span>
      <h3>${escapeHtml(a.name)}</h3>
      <p class="meta">by ${escapeHtml(a.creator)}</p>
      <p>${escapeHtml(a.description)}</p>
      <div class="meta-row"><span class="meta">${a.edition}</span><span class="meta">${a.versions.join(", ")}</span></div>
      <div class="card__actions">
        <a class="btn btn--small btn--primary" href="${a.url}" target="_blank" rel="noopener">View source</a>
        <button class="btn btn--small btn--ghost" data-action="save-addon" data-id="${a.id}">${saved ? "Saved" : "Save"}</button>
      </div>
    </div>`;
}

/* ---------------- Trending ---------------- */

function renderTrending() {
  const community = getCommunityResults();
  return `
    <div class="page-header"><div><h1>Trending</h1><p class="page-sub">What the community is testing right now.</p></div></div>
    <div class="grid grid--3up">${MOCK.trending.map(trendingCard).join("")}</div>
    ${community.length ? `
      <section class="section-block">
        <h2>Community results</h2>
        <div class="grid grid--3up">${community.map(communityCard).join("")}</div>
      </section>` : ""}
  `;
}

function communityCard(r) {
  return `
    <div class="card">
      <span class="card__eyebrow">${escapeHtml(r.creator)}</span>
      <h3>${escapeHtml(r.title)}</h3>
      <div class="meta-row"><span class="pill ${statusPillClass(r.result)}">${r.result}</span><span class="meta">${r.edition} • ${r.version}</span></div>
      <div class="card__actions">
        <button class="btn btn--small btn--ghost" data-action="like-result" data-id="${r.id}">Like (${r.likes})</button>
      </div>
    </div>`;
}

/* ---------------- My Tests ---------------- */

function renderMyTests() {
  const tests = getMyTests();
  const groups = {
    "In Progress": tests.filter((t) => t.status === "In Progress"),
    Completed: tests.filter((t) => t.status === "Completed" && !t.published),
    Published: tests.filter((t) => t.published)
  };
  return `
    <div class="page-header"><div><h1>My Tests</h1><p class="page-sub">Your personal experiment log.</p></div></div>
    ${Object.entries(groups).map(([label, items]) => `
      <section class="section-block">
        <h2>${label} <span class="count-badge">${items.length}</span></h2>
        ${items.length ? `<div class="grid grid--3up">${items.map(myTestCard).join("")}</div>` : `<p class="empty-state">Nothing here yet.</p>`}
      </section>
    `).join("")}
  `;
}

function myTestCard(t) {
  return `
    <div class="card">
      <span class="card__eyebrow">${t.status}</span>
      <h3>${escapeHtml(t.title)}</h3>
      <span class="meta">${new Date(t.createdAt).toLocaleDateString()} • ${t.version}</span>
      ${t.result ? `<div class="meta-row"><span class="pill ${statusPillClass(t.result)}">${t.result}</span></div>` : ""}
      <div class="card__actions">
        <button class="btn btn--small btn--primary" data-action="continue-test" data-id="${t.id}">${t.status === "Completed" ? "View result" : "Continue"}</button>
        ${t.status === "Completed" ? `<button class="btn btn--small btn--ghost" data-action="video-pack" data-id="${t.id}">Video pack</button>` : ""}
      </div>
    </div>`;
}

/* ---------------- Saved ---------------- */

function renderSaved(state) {
  const filter = state.filter || "All";
  const items = getSavedItems().filter((i) => filter === "All" || i.type === filter);
  const types = ["All", "myth", "challenge", "secret", "addon", "whatif"];
  return `
    <div class="page-header"><div><h1>Saved</h1><p class="page-sub">Everything you've bookmarked.</p></div></div>
    <div class="chip-row">${types.map((t) => `<button class="chip ${t === filter ? "chip--active" : ""}" data-savedfilter="${t}">${t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}</button>`).join("")}</div>
    ${items.length ? `<div class="grid grid--3up">${items.map(savedCard).join("")}</div>` : `<p class="empty-state">Nothing saved yet. Save myths, challenges, secrets, addons, and scenarios to find them here.</p>`}
  `;
}

function savedCard(item) {
  return `
    <div class="card">
      <span class="card__eyebrow">${item.type}</span>
      <h3>${escapeHtml(item.title || item.name)}</h3>
      <div class="card__actions">
        <button class="btn btn--small btn--ghost" data-action="unsave" data-id="${item.id}" data-type="${item.type}">Remove</button>
      </div>
    </div>`;
}

/* ---------------- Profile ---------------- */

function renderProfile() {
  const user = getCurrentUser();
  const tests = getMyTests();
  if (!user) {
    return `
      <div class="page-header"><div><h1>Profile</h1></div></div>
      <div class="card auth-card">
        <p>Sign in to save experiments, track tests, and publish results.</p>
        <button class="btn btn--primary" id="signin-btn">Continue with Google</button>
      </div>`;
  }
  return `
    <div class="page-header"><div><h1>Profile</h1></div></div>
    <div class="card profile-card">
      <div class="avatar avatar--lg">${initials(user.displayName)}</div>
      <div>
        <h2>${escapeHtml(user.displayName)}</h2>
        <p class="meta">${escapeHtml(user.email)}</p>
        ${user.demo ? `<span class="badge">Demo Mode</span>` : ""}
      </div>
    </div>
    <div class="stat-row">
      <div class="stat"><span class="stat__value">${tests.length}</span><span class="stat__label">Tests run</span></div>
      <div class="stat"><span class="stat__value">${tests.filter((t) => t.published).length}</span><span class="stat__label">Published</span></div>
      <div class="stat"><span class="stat__value">${getSavedItems().length}</span><span class="stat__label">Saved</span></div>
    </div>
    <button class="btn btn--ghost" id="signout-btn">Sign out</button>
  `;
}

function initials(name) {
  return (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/* ---------------- Settings ---------------- */

function renderSettings() {
  const s = getSettings();
  return `
    <div class="page-header"><div><h1>Settings</h1></div></div>
    <div class="card settings-card">
      <label>Default Minecraft edition
        <select id="set-edition">${MOCK.editions.map((e) => `<option ${s.defaultEdition === e ? "selected" : ""}>${e}</option>`).join("")}</select>
      </label>
      <label>Default Minecraft version
        <select id="set-version">${MOCK.versions.map((v) => `<option ${s.defaultVersion === v ? "selected" : ""}>${v}</option>`).join("")}</select>
      </label>
      <label>AI tone
        <select id="set-tone">
          ${["energetic", "calm", "sarcastic", "documentary"].map((t) => `<option ${s.aiTone === t ? "selected" : ""}>${t}</option>`).join("")}
        </select>
      </label>
      <label class="switch-row"><span>Notifications</span><input type="checkbox" id="set-notifications" ${s.notifications ? "checked" : ""}></label>
      <label class="switch-row"><span>Publish results publicly by default</span><input type="checkbox" id="set-privacy" ${s.privacyPublicResults ? "checked" : ""}></label>
      <button class="btn btn--primary" id="save-settings-btn">Save settings</button>
    </div>
  `;
}
