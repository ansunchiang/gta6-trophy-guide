(() => {
  const trophies = catalog.trophies;
  const grades = ["platinum", "gold", "silver", "bronze"];
  const labels = { all: "All", story: "Story", missable: "Missable", collectibles: "Collectibles", activities: "Activities", online: "Online" };
  const stages = { window: "Before the Chapter 1 break", story: "During the story", completion: "100% completion", cleanup: "Free-roam cleanup", platinum: "Platinum" };
  const byId = new Map(trophies.map(trophy => [trophy.id, trophy]));
  const $ = id => document.getElementById(id);
  const view = { kind: "all", grade: "all", selected: null, query: "", unearned: false, roadmap: false, mobileGuide: false };
  const mobile = matchMedia("(max-width: 760px)");
  let state = progressStore.read();
  let messageTimer;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(label, className, action) {
    const node = element("button", className, label);
    node.type = "button";
    node.addEventListener("click", action);
    return node;
  }

  function sourceLink(id) {
    const source = catalog.sources[id];
    const link = element("a", "source", source.name + " ↗");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  function announce(text) {
    clearTimeout(messageTimer);
    $("message").textContent = text;
    $("message").hidden = false;
    messageTimer = setTimeout(() => { $("message").hidden = true; }, 4200);
  }

  function isMasked(trophy) {
    return trophy.kind === "story" && state.hideSpoilers && !state.earned.has(trophy.id);
  }

  function trophyName(trophy) {
    return isMasked(trophy) ? "Hidden story trophy" : trophy.name;
  }

  function trophyDescription(trophy) {
    if (!isMasked(trophy)) return trophy.description;
    const chapter = trophies.filter(item => item.chapter === trophy.chapter).sort((a, b) => a.order - b.order);
    return "Chapter " + trophy.chapter + " · Milestone " + (chapter.indexOf(trophy) + 1) + " of " + chapter.length;
  }

  function inKind(trophy, kind) {
    if (kind === "all") return true;
    if (kind === "missable") return trophy.missable;
    return trophy.kind === kind || (kind === "collectibles" && trophy.kind === "missable");
  }

  function matchesSearch(trophy) {
    const words = view.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const fields = [trophyName(trophy), trophyDescription(trophy), trophy.grade, labels[trophy.kind]];
    if (!isMasked(trophy)) fields.push(trophy.guide, trophy.extra ?? "");
    const text = fields.join(" ").toLowerCase();
    return words.every(word => text.includes(word));
  }

  function gradeBadge(grade) {
    const badge = element("span", "grade grade-" + grade);
    const icon = element("span", "grade-mark", "◆");
    icon.setAttribute("aria-hidden", "true");
    badge.append(icon, grade);
    return badge;
  }

  function riskBadge(trophy) {
    const labels = { "potentially missable": "Potentially missable", "time-sensitive strand": "Time-sensitive", unconfirmed: "Trigger unconfirmed" };
    return element("span", "risk", "△ " + labels[trophy.risk]);
  }

  function updateProgress(persist = false) {
    const count = state.earned.size;
    $("side-earned").textContent = count + " / " + trophies.length;
    $("side-percent").textContent = Math.round(count * 100 / trophies.length) + "%";
    $("progress-bar").value = count;
    $("spoiler").checked = state.hideSpoilers;
    if (persist && !progressStore.save(state)) {
      $("save-status").textContent = "Storage unavailable. Export to keep progress.";
    }
  }

  function toggleEarned(id, focus) {
    if (state.earned.has(id)) state.earned.delete(id);
    else state.earned.add(id);
    updateProgress(true);
    render();
    const replacement = focus === "guide" ? $("guide-earn") : $("earn-" + id);
    (replacement ?? $("search")).focus({ preventScroll: true });
    if (isMasked(byId.get(id))) announce("Trophy unchecked. Story details hidden.");
    else announce(state.earned.has(id) ? "Trophy marked earned." : "Trophy unchecked.");
  }

  function applyHash() {
    const fragment = location.hash.slice(1);
    view.roadmap = fragment === "roadmap";
    if (!view.roadmap && fragment !== "content") {
      const params = new URLSearchParams(fragment);
      const id = Number(params.get("t"));
      view.kind = Object.hasOwn(labels, params.get("kind")) ? params.get("kind") : "all";
      view.selected = byId.has(id) ? id : null;
      view.query = "";
      view.unearned = false;
      view.grade = "all";
      $("search").value = "";
      $("unearned").checked = false;
      $("grade").value = "all";
    }
    view.mobileGuide = !view.roadmap && byId.has(view.selected) && fragment.includes("t=");
    render();
    if (fragment !== "content") window.scrollTo(0, 0);
  }

  function openTrophy(trophy) {
    view.selected = trophy.id;
    view.mobileGuide = true;
    renderTracker();
    if (mobile.matches) {
      $("guide-title").focus({ preventScroll: true });
      $("guide-panel").scrollIntoView({ block: "start" });
    } else {
      $("open-" + trophy.id).focus({ preventScroll: true });
    }
  }

  function trophyRow(trophy) {
    const row = element("article", "trophy-row");
    row.classList.toggle("selected", trophy.id === view.selected);
    row.classList.toggle("earned", state.earned.has(trophy.id));
    const check = element("input", "earn-checkbox");
    check.type = "checkbox";
    check.id = "earn-" + trophy.id;
    check.checked = state.earned.has(trophy.id);
    check.setAttribute("aria-label", "Earned: " + trophyName(trophy));
    check.addEventListener("change", () => toggleEarned(trophy.id, "row"));
    const open = button("", "open-trophy", () => openTrophy(trophy));
    open.id = "open-" + trophy.id;
    open.setAttribute("aria-pressed", String(trophy.id === view.selected));
    const text = element("span", "row-text");
    const name = element("span", "trophy-name", trophyName(trophy));
    const description = element("span", "trophy-description", trophyDescription(trophy));
    text.append(name, description);
    if (trophy.risk) text.append(riskBadge(trophy));
    open.append(text, gradeBadge(trophy.grade), element("span", "chevron", "›"));
    row.append(check, open);
    return row;
  }

  function renderGuide(trophy) {
    const panel = $("guide-panel");
    panel.replaceChildren();
    panel.hidden = !trophy || (mobile.matches && !view.mobileGuide);
    if (!trophy || panel.hidden) return;
    const masked = isMasked(trophy);
    const earned = state.earned.has(trophy.id);
    const heading = element("div", "guide-top");
    heading.append(element("p", "guide-label", "Trophy guide"), gradeBadge(trophy.grade));
    const title = element("h3", null, trophyName(trophy));
    title.id = "guide-title";
    title.tabIndex = -1;
    const close = button("← Back to list", "mobile-return", () => {
      view.mobileGuide = false;
      renderTracker();
      $("open-" + trophy.id).focus();
    });
    panel.append(close, heading, title, element("p", "official", trophyDescription(trophy)));
    if (trophy.risk) panel.append(riskBadge(trophy));
    const details = element("div", "guide-content");
    if (masked) {
      details.append(element("p", null, "Story spoiler protection is on. Mark the trophy earned once it appears on your PS5 to reveal its guide."));
    } else {
      details.append(element("h4", null, "How to unlock"), element("p", null, trophy.guide));
      if (trophy.extra) details.append(element("p", null, trophy.extra));
      const sources = element("div", "sources");
      sources.append(...trophy.sources.map(sourceLink), sourceLink("psn"));
      details.append(sources);
    }
    panel.append(details);
    const footer = element("div", "guide-footer");
    const earn = button(earned ? "✓ Earned" : "Mark as earned", "primary", () => toggleEarned(trophy.id, "guide"));
    earn.id = "guide-earn";
    earn.setAttribute("aria-pressed", String(earned));
    footer.append(earn, element("span", "guide-stage", masked ? "Story" : stages[trophy.stage]));
    panel.append(footer);
  }

  function renderFilters() {
    const filters = $("kind-filters");
    filters.replaceChildren();
    for (const [kind, label] of Object.entries(labels)) {
      const count = trophies.filter(trophy => inKind(trophy, kind)).length;
      const filter = button("", "filter", () => {
        view.kind = kind;
        view.selected = null;
        view.mobileGuide = false;
        renderTracker();
        $("filter-" + kind).focus({ preventScroll: true });
      });
      filter.id = "filter-" + kind;
      filter.setAttribute("aria-pressed", String(view.kind === kind));
      filter.append(label, element("span", null, count));
      filters.append(filter);
    }
  }

  function renderTracker() {
    const filtered = trophies.filter(trophy =>
      inKind(trophy, view.kind) && (view.grade === "all" || trophy.grade === view.grade) &&
      (!view.unearned || !state.earned.has(trophy.id)) && matchesSearch(trophy)
    );
    if (view.kind === "story") filtered.sort((a, b) => a.order - b.order);
    if (view.kind === "missable") filtered.sort((a, b) => Number(b.stage === "window") - Number(a.stage === "window"));
    if (!filtered.some(trophy => trophy.id === view.selected)) {
      view.selected = filtered[0]?.id;
      view.mobileGuide = false;
    }
    renderFilters();
    $("content").classList.toggle("compact-hero", ["story", "missable"].includes(view.kind));
    $("result-count").textContent = filtered.length + " of " + trophies.length + " trophies";
    $("trophy-list").replaceChildren(...filtered.map(trophyRow));
    if (view.kind === "missable" && filtered.length) {
      $("trophy-list").append(element("p", "risk-note", "Take the balcony invitation in Chapter 1 and prioritize Yago’s race when it appears in Chapter 3. Both are time-sensitive. Their effect on the platinum is still being verified."));
    }
    if (!filtered.length) {
      const text = view.kind === "online" ? "The PS5 base-game list has no online trophies." : "No trophies match your filters.";
      $("trophy-list").append(element("p", "empty", text));
    }
    renderGuide(byId.get(view.selected));
  }

  function guideLink(id) {
    const trophy = byId.get(id);
    const link = element("a", "route-link", trophyName(trophy) + " ›");
    link.href = "#kind=" + trophy.kind + "&t=" + id;
    return link;
  }

  function routeCard(number, title, text, links, sources) {
    const card = element("article", "route-card");
    const index = element("span", "route-number", number);
    const body = element("div", "route-body");
    body.append(element("h3", null, title), element("p", null, text));
    const resources = element("div", "route-resources");
    if (links.length) {
      const group = element("div", "route-links");
      group.append(...links.map(guideLink));
      resources.append(group);
    }
    if (sources.length) {
      const group = element("div", "sources");
      group.append(...sources.map(sourceLink));
      resources.append(group);
    }
    if (resources.childElementCount) body.append(resources);
    card.append(index, body);
    return card;
  }

  function completionDetails() {
    const details = element("details", "completion-details");
    details.append(element("summary", null, "Full in-game 100% requirements"));
    const groups = element("div", "completion-groups");
    const checklist = [
      ["Story and jobs", [
        "Finish the story and any 100 optional tasks", "39 gang operations, 22 bank jobs and 7 payday loans",
        "34 of 35 smash-and-grabs, 50 of 91 stickups and all 8 vaults",
        "Fence $100,000 in narcotics, $100,000 in jewelry, $250,000 in marked bills and $200,000 in vehicles"
      ]],
      ["Exploration", [
        "5 Kenton treasure sets and 33 underwater discoveries", "15 card sets, 100 WAiNK scans and 30 books, magazines or comics",
        "15 meditations, 100 cocaine flamingos, 2 playlists and 70 styles",
        "Scan 200 base vehicle models, find 50 standard weapons and study 100 animals"
      ]],
      ["Activities", [
        "30 race wins, 10 race-challenge golds and 42 range golds", "Play 4 video games and 2 mini golf locations",
        "Beat 5 pool opponents, score 90 basketball hoops and finish 42 drone trials",
        "300 stunts, 70 challenges and all 15 of Bret’s Target Decks"
      ]]
    ];
    for (const [title, entries] of checklist) {
      const group = element("div");
      const items = element("ul");
      items.append(...entries.map(entry => element("li", null, entry)));
      group.append(element("h4", null, title), items);
      groups.append(group);
    }
    details.append(groups);
    return details;
  }

  function renderRoadmap() {
    const road = $("roadmap-view");
    const intro = element("div", "section-heading road-heading");
    const heading = element("div");
    heading.append(element("h1", null, "Platinum roadmap"), element("p", null, "Start with the Chapter 1 window, then work through story and free roam."));
    intro.append(heading);
    const cards = element("div", "route-grid");
    const story = routeCard("02", "Follow the story", "Keep chapter saves. Scan base vehicles and study animals along the way. Take Yago’s timed race when offered in Chapter 3.", [], ["missions"]);
    const chapters = element("div", "chapter-grid");
    for (let chapter = 1; chapter <= 5; chapter++) {
      const milestones = trophies.filter(trophy => trophy.chapter === chapter).sort((a, b) => a.order - b.order);
      const group = element("details", "chapter");
      group.open = !state.hideSpoilers || milestones.some(trophy => state.earned.has(trophy.id));
      group.append(element("summary", null, "Chapter " + chapter));
      for (const trophy of milestones) {
        const item = element("div", "chapter-trophy");
        item.append(guideLink(trophy.id), element("small", null, trophyDescription(trophy)));
        group.append(item);
      }
      chapters.append(group);
    }
    story.querySelector(".route-body").append(chapters);
    const completion = routeCard("03", "Complete the in-game 100%", "After the story, open Progress › Stats › 100% Completion. Earlier progress carries forward.", [14], ["completion"]);
    const quotas = element("ul", "quotas");
    const targets = [
      ["300", "stunts", 15], ["15", "card sets", 30], ["100", "WAiNK scans", 31],
      ["42", "range golds", 17], ["70", "challenges", 32], ["30", "race wins", 19],
      ["42", "drone trials", 18], ["8", "bank vaults", 40]
    ];
    for (const [count, label, id] of targets) {
      const cell = element("li");
      const link = guideLink(id);
      link.replaceChildren(element("strong", null, count), label);
      cell.append(link);
      quotas.append(cell);
    }
    completion.querySelector(".route-body").append(quotas, completionDetails());
    cards.append(
      routeCard("01", "Before leaving Chapter 1", "After Down to Earth, accept Lucia’s morning meditation at Jason’s house. Take the one-time invitation while it’s available.", [28], ["meditation"]),
      story,
      completion,
      routeCard("04", "Finish the remaining trophies", "Check the side strands and one-off activities after 100%. Finish eight qualifying stranger strands and clear all 54 non-platinum trophies.", [25, 1], ["guide", "strangers"])
    );
    road.replaceChildren(intro, cards);
  }

  function render() {
    $("tracker").hidden = view.roadmap;
    $("roadmap-view").hidden = !view.roadmap;
    $("content").classList.toggle("roadmap-active", view.roadmap);
    $("breadcrumb").textContent = view.roadmap ? "Platinum roadmap" : "Trophy tracker";
    $("tracker-link").setAttribute("aria-current", view.roadmap ? "false" : "page");
    $("roadmap-link").setAttribute("aria-current", view.roadmap ? "page" : "false");
    if (view.roadmap) renderRoadmap();
    else renderTracker();
  }

  $("grade-summary").append(...grades.map(grade => {
    const badge = gradeBadge(grade);
    badge.append(element("b", null, trophies.filter(trophy => trophy.grade === grade).length));
    return badge;
  }));
  $("search").addEventListener("input", event => {
    view.query = event.target.value;
    renderTracker();
  });
  $("unearned").addEventListener("change", event => {
    view.unearned = event.target.checked;
    renderTracker();
  });
  $("grade").addEventListener("change", event => {
    view.grade = event.target.value;
    renderTracker();
  });
  $("spoiler").addEventListener("change", event => {
    state.hideSpoilers = event.target.checked;
    updateProgress(true);
    render();
  });
  $("export").addEventListener("click", () => {
    progressStore.download(state);
    announce("Progress file exported.");
  });
  $("import-button").addEventListener("click", () => $("import-file").click());
  $("import-file").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 16384) throw new Error("This progress file is too large.");
      const imported = progressStore.decode(await file.text());
      state = { earned: new Set([...state.earned, ...imported.earned]), hideSpoilers: imported.hideSpoilers };
      updateProgress(true);
      render();
      announce("Progress imported. Earned trophies combined.");
    } catch {
      announce("Import failed. Choose a valid Vice Ledger progress file.");
    } finally {
      event.target.value = "";
    }
  });
  addEventListener("hashchange", applyHash);
  mobile.addEventListener("change", render);
  updateProgress();
  applyHash();
})();
