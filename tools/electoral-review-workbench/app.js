const DATA_DIR = "./public/data";
const STORAGE_KEY = "electoral-review-workbench-decisions-v2";
const MAX_TASK_CARDS = 700;
const MAX_TABLE_ROWS = 350;
const EXPORT_FIELDS = [
  "review_id",
  "task_id",
  "case_type",
  "census_cell_id",
  "involved_streets",
  "current_assignment_method",
  "current_assigned_section",
  "suggested_section_number",
  "competing_sections",
  "proposed_section_number",
  "decision_type",
  "decision_confidence",
  "reason",
  "qgis_observation",
  "reviewed_by",
  "review_date",
  "requires_follow_up",
  "notes",
  "evidence_snapshot",
];

const DECISION_TYPES = [
  "confirm_suggested_section",
  "assign_to_alternative_section",
  "keep_unassigned",
  "keep_conflict",
  "split_required",
  "needs_external_source",
  "needs_qgis_review",
];

const state = {
  data: {},
  tasks: [],
  filteredTasks: [],
  decisions: {},
  selectedTaskId: "",
  selectedCivicAccessId: "",
  activeTab: "summary",
  civicFilter: "all",
  dirtySinceExport: false,
  map: null,
  mapMode: "pending",
  osmLayer: null,
  leafletLayers: {},
  fallbackBBox: null,
  showNearby: false,
  showCompeting: false,
};

const el = {
  summaryStrip: document.getElementById("summaryStrip"),
  taskCountBadge: document.getElementById("taskCountBadge"),
  taskListMeta: document.getElementById("taskListMeta"),
  taskList: document.getElementById("taskList"),
  taskTitle: document.getElementById("taskTitle"),
  taskBadges: document.getElementById("taskBadges"),
  tabPanel: document.getElementById("tabPanel"),
  mapCanvas: document.getElementById("mapCanvas"),
  fallbackMap: document.getElementById("fallbackMap"),
  mapStatus: document.getElementById("mapStatus"),
  importDecisionFile: document.getElementById("importDecisionFile"),
  importDecisionButton: document.getElementById("importDecisionButton"),
  exportJsonButton: document.getElementById("exportJsonButton"),
  exportCsvButton: document.getElementById("exportCsvButton"),
  filters: {
    search: document.getElementById("searchFilter"),
    taskType: document.getElementById("taskTypeFilter"),
    priority: document.getElementById("priorityFilter"),
    status: document.getElementById("statusFilter"),
    suggestedSection: document.getElementById("suggestedSectionFilter"),
    competingSection: document.getElementById("competingSectionFilter"),
    street: document.getElementById("streetFilter"),
    reason: document.getElementById("reasonFilter"),
    streetEvidence: document.getElementById("streetEvidenceFilter"),
    decisionType: document.getElementById("decisionTypeFilter"),
    sort: document.getElementById("sortSelect"),
    highOnly: document.getElementById("highOnlyFilter"),
    manyCivics: document.getElementById("manyCivicsFilter"),
    visibleExtent: document.getElementById("visibleExtentFilter"),
  },
  toggles: {
    osm: document.getElementById("toggleOsm"),
    v3: document.getElementById("toggleV3"),
    v2: document.getElementById("toggleV2"),
    cells: document.getElementById("toggleCells"),
    reviewPoints: document.getElementById("toggleReviewPoints"),
    boundaryPoints: document.getElementById("toggleBoundaryPoints"),
    resolvedPoints: document.getElementById("toggleResolvedPoints"),
    deterministicPoints: document.getElementById("toggleDeterministicPoints"),
  },
  zoomSelectedButton: document.getElementById("zoomSelectedButton"),
  showNearbyButton: document.getElementById("showNearbyButton"),
  showCompetingButton: document.getElementById("showCompetingButton"),
};

async function fetchJson(name) {
  const response = await fetch(`${DATA_DIR}/${name}`);
  if (!response.ok) {
    throw new Error(`Could not load ${name}: ${response.status}`);
  }
  return response.json();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function asString(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function numberLabel(value, digits = 0) {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return asString(value);
  return parsed.toLocaleString("it-IT", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function titleCase(value) {
  return asString(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function sectionSort(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
  return asString(a).localeCompare(asString(b), "it");
}

function splitSections(value) {
  return asString(value)
    .replaceAll(",", ";")
    .split(";")
    .map((part) => part.split(":", 1)[0].trim())
    .filter(Boolean);
}

function splitList(value) {
  return asString(value)
    .replaceAll(",", ";")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

function selectedTask() {
  return state.tasks.find((task) => task.task_id === state.selectedTaskId) || null;
}

function taskDecision(taskId) {
  return state.decisions[taskId] || null;
}

function decisionStatus(taskId) {
  const decision = taskDecision(taskId);
  if (!decision) return "undecided";
  return decision.requires_follow_up === true || decision.requires_follow_up === "true" ? "follow_up" : "decided";
}

function loadDecisions() {
  try {
    state.decisions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    state.decisions = {};
  }
}

function persistDecisions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.decisions));
  state.dirtySinceExport = true;
}

function badge(label, tone = "") {
  return `<span class="badge ${escapeHtml(tone || asString(label).toLowerCase())}">${escapeHtml(label)}</span>`;
}

function taskStatusBadge(taskId) {
  const status = decisionStatus(taskId);
  if (status === "decided") return badge("Decided", "decided");
  if (status === "follow_up") return badge("Follow-up", "follow");
  return badge("Open", "undecided");
}

function evidenceBadge(task) {
  if (task.street_register_match_status === "direct_match") return badge("Direct rule", "strong");
  if (task.street_register_match_status === "multiple_sections") return badge("Multiple rules", "medium");
  if (task.has_street_register_evidence) return badge("Street match", "weak");
  return badge("No rule match", "none");
}

function taskByTypeCounts() {
  const counts = {};
  for (const task of state.tasks) {
    counts[task.task_type] = (counts[task.task_type] || 0) + 1;
  }
  return counts;
}

function renderSummaryStrip() {
  const summary = state.data.summary || {};
  const total = state.tasks.length;
  const visible = state.filteredTasks.length;
  const decisions = Object.values(state.decisions).filter((decision) => state.tasks.some((task) => task.task_id === decision.task_id));
  const followUp = decisions.filter((decision) => decision.requires_follow_up === true || decision.requires_follow_up === "true").length;
  const highOpen = state.tasks.filter((task) => task.priority === "high" && decisionStatus(task.task_id) === "undecided").length;
  el.summaryStrip.innerHTML = [
    `<span>${numberLabel(total)} tasks</span>`,
    `<span>${numberLabel(visible)} visible</span>`,
    `<span>${numberLabel(decisions.length)} decided</span>`,
    `<span>${numberLabel(highOpen)} high open</span>`,
    `<span>${numberLabel(followUp)} follow-up</span>`,
    `<span>${numberLabel(summary.tasks_with_street_register_evidence)} with street evidence</span>`,
    `<span>${numberLabel(summary.tasks_without_street_register_match)} no street match</span>`,
  ].join("");
}

function populateSelect(select, values, formatter = titleCase) {
  const current = select.value;
  const first = select.querySelector("option[value='']");
  select.innerHTML = "";
  select.appendChild(first || new Option("All", ""));
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = formatter(value);
    select.appendChild(option);
  }
  select.value = values.includes(current) ? current : "";
}

function populateFilters() {
  populateSelect(el.filters.taskType, [...new Set(state.tasks.map((task) => task.task_type))].sort(), titleCase);
  populateSelect(el.filters.priority, [...new Set(state.tasks.map((task) => task.priority).filter(Boolean))].sort(), titleCase);
  populateSelect(
    el.filters.suggestedSection,
    [...new Set(state.tasks.map((task) => asString(task.suggested_section_number)).filter(Boolean))].sort(sectionSort),
    asString,
  );
  populateSelect(
    el.filters.competingSection,
    [...new Set(state.tasks.flatMap((task) => asArray(task.competing_sections)).filter(Boolean))].sort(sectionSort),
    asString,
  );
  populateSelect(
    el.filters.street,
    [...new Set(state.tasks.flatMap((task) => asArray(task.involved_streets)).filter(Boolean))].sort((a, b) => a.localeCompare(b, "it")),
    asString,
  );
  populateSelect(
    el.filters.reason,
    [...new Set(state.tasks.map((task) => task.unresolved_reason).filter(Boolean))].sort((a, b) => a.localeCompare(b, "it")),
    titleCase,
  );
  populateSelect(el.filters.decisionType, DECISION_TYPES, titleCase);
}

function currentFilters() {
  return {
    search: el.filters.search.value.trim().toLowerCase(),
    taskType: el.filters.taskType.value,
    priority: el.filters.priority.value,
    status: el.filters.status.value,
    suggestedSection: el.filters.suggestedSection.value,
    competingSection: el.filters.competingSection.value,
    street: el.filters.street.value,
    reason: el.filters.reason.value,
    streetEvidence: el.filters.streetEvidence.value,
    decisionType: el.filters.decisionType.value,
    sort: el.filters.sort.value,
    highOnly: el.filters.highOnly.checked,
    manyCivics: el.filters.manyCivics.checked,
    visibleExtent: el.filters.visibleExtent.checked,
  };
}

function bboxIntersectsLeafletBounds(bbox, bounds) {
  if (!bbox || bbox.length !== 4 || !bounds) return false;
  const taskBounds = window.L.latLngBounds(
    [bbox[1], bbox[0]],
    [bbox[3], bbox[2]],
  );
  return bounds.intersects(taskBounds);
}

function taskVisibleInCurrentExtent(task) {
  if (!state.map || typeof window.L === "undefined") return true;
  return bboxIntersectsLeafletBounds(task.map_focus_bbox, state.map.getBounds());
}

function taskMatchesFilters(task, filters) {
  if (filters.taskType && task.task_type !== filters.taskType) return false;
  if (filters.priority && task.priority !== filters.priority) return false;
  if (filters.highOnly && task.priority !== "high") return false;
  if (filters.manyCivics && asNumber(task.civic_count) < 10) return false;
  if (filters.status && decisionStatus(task.task_id) !== filters.status) return false;
  if (filters.suggestedSection && asString(task.suggested_section_number) !== filters.suggestedSection) return false;
  if (filters.competingSection && !asArray(task.competing_sections).includes(filters.competingSection)) return false;
  if (filters.street && !asArray(task.involved_streets).includes(filters.street)) return false;
  if (filters.reason && task.unresolved_reason !== filters.reason) return false;
  if (filters.streetEvidence === "has" && !task.has_street_register_evidence) return false;
  if (filters.streetEvidence === "multiple" && !task.has_multiple_candidate_sections) return false;
  if (filters.streetEvidence === "none" && !task.has_no_street_register_match) return false;
  const decision = taskDecision(task.task_id);
  if (filters.decisionType && (!decision || decision.decision_type !== filters.decisionType)) return false;
  if (filters.visibleExtent && !taskVisibleInCurrentExtent(task)) return false;
  if (!filters.search) return true;
  const haystack = [
    task.task_id,
    task.task_type,
    task.title,
    task.short_description,
    task.why_needs_review,
    task.suggested_section_number,
    asArray(task.competing_sections).join(" "),
    asArray(task.involved_streets).join(" "),
    task.civic_range_summary,
    task.census_cell_id,
    task.unresolved_reason,
    task.notes,
  ].join(" ").toLowerCase();
  return haystack.includes(filters.search);
}

function sortTasks(tasks, sortMode) {
  const priorityRank = { high: 0, medium: 1, low: 2 };
  const strengthRank = { strong: 0, medium: 1, weak: 2, none: 3 };
  const copy = [...tasks];
  copy.sort((a, b) => {
    if (sortMode === "civic_count_desc") return asNumber(b.civic_count) - asNumber(a.civic_count);
    if (sortMode === "evidence_strength") return (strengthRank[a.evidence_strength] ?? 9) - (strengthRank[b.evidence_strength] ?? 9);
    if (sortMode === "dominant_share_asc") return asNumber(a.dominant_section_share, 1) - asNumber(b.dominant_section_share, 1);
    if (sortMode === "suggested_section") return sectionSort(a.suggested_section_number, b.suggested_section_number);
    if (sortMode === "unresolved_reason") return asString(a.unresolved_reason).localeCompare(asString(b.unresolved_reason), "it");
    const priority = (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
    if (priority !== 0) return priority;
    return asNumber(b.civic_count) - asNumber(a.civic_count);
  });
  return copy;
}

function applyFilters({ keepSelection = true } = {}) {
  const filters = currentFilters();
  state.filteredTasks = sortTasks(state.tasks.filter((task) => taskMatchesFilters(task, filters)), filters.sort);
  if (!keepSelection || (state.selectedTaskId && !state.filteredTasks.some((task) => task.task_id === state.selectedTaskId))) {
    state.selectedTaskId = state.filteredTasks[0]?.task_id || state.tasks[0]?.task_id || "";
  }
  renderSummaryStrip();
  renderTaskList();
  renderSelectedTask();
  refreshMap();
}

function renderTaskList() {
  const visible = state.filteredTasks.slice(0, MAX_TASK_CARDS);
  const hidden = Math.max(state.filteredTasks.length - visible.length, 0);
  el.taskCountBadge.textContent = numberLabel(state.filteredTasks.length);
  el.taskListMeta.textContent = hidden
    ? `${numberLabel(state.filteredTasks.length)} matching tasks; showing first ${numberLabel(visible.length)}.`
    : `${numberLabel(state.filteredTasks.length)} matching tasks.`;
  el.taskList.innerHTML = visible.map((task) => {
    const selected = task.task_id === state.selectedTaskId ? " selected" : "";
    const streets = asArray(task.involved_streets).slice(0, 2).join(", ");
    return `
      <button class="task-card${selected}" type="button" data-task-id="${escapeHtml(task.task_id)}">
        <span class="task-card-top">
          <strong>${escapeHtml(task.title)}</strong>
          ${taskStatusBadge(task.task_id)}
        </span>
        <span class="task-card-line">${escapeHtml(task.short_description || task.why_needs_review || "")}</span>
        <span class="task-card-meta">
          ${badge(titleCase(task.task_type), "type")}
          ${badge(titleCase(task.priority || "none"), task.priority || "none")}
          ${task.suggested_section_number ? badge(`Sec ${task.suggested_section_number}`, "section") : ""}
          ${evidenceBadge(task)}
        </span>
        <span class="task-card-foot">
          <span>${numberLabel(task.civic_count)} civics</span>
          <span>${escapeHtml(streets || task.unresolved_reason || "")}</span>
        </span>
      </button>
    `;
  }).join("");
}

function selectTask(taskId, { zoom = true } = {}) {
  if (!taskId || !state.tasks.some((task) => task.task_id === taskId)) return;
  state.selectedTaskId = taskId;
  state.selectedCivicAccessId = "";
  state.showNearby = false;
  state.showCompeting = false;
  renderTaskList();
  renderSelectedTask();
  refreshMap();
  if (zoom) zoomToSelectedTask();
}

function renderSelectedTask() {
  const task = selectedTask();
  if (!task) {
    el.taskTitle.textContent = "No task selected";
    el.taskBadges.innerHTML = "";
    el.tabPanel.innerHTML = `<p class="empty-state">Select a review task.</p>`;
    return;
  }
  el.taskTitle.textContent = task.title;
  el.taskBadges.innerHTML = [
    badge(titleCase(task.task_type), "type"),
    badge(titleCase(task.priority || "none"), task.priority || "none"),
    task.suggested_section_number ? badge(`Suggested ${task.suggested_section_number}`, "section") : "",
    taskStatusBadge(task.task_id),
    evidenceBadge(task),
  ].join("");
  renderActiveTab();
}

function factGrid(rows) {
  return `<dl class="fact-grid">${rows
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join("")}</dl>`;
}

function renderSummaryTab(task) {
  const dominant = task.dominant_section_share !== "" && task.dominant_section_share !== null
    ? `${numberLabel(asNumber(task.dominant_section_share) * 100, 1)}%`
    : "";
  return `
    ${factGrid([
      ["Task id", task.task_id],
      ["Task type", titleCase(task.task_type)],
      ["Priority", titleCase(task.priority)],
      ["Suggested section", task.suggested_section_number],
      ["Competing sections", asArray(task.competing_sections).join(", ")],
      ["Dominant share", dominant],
      ["Census cell", task.census_cell_id],
      ["Civics", numberLabel(task.civic_count)],
      ["Civic range", task.civic_range_summary],
      ["Reason", titleCase(task.unresolved_reason)],
      ["Evidence strength", titleCase(task.evidence_strength)],
      ["Street-register status", titleCase(task.street_register_match_status)],
    ])}
    <div class="narrative-block">
      <h3>Why it needs review</h3>
      <p>${escapeHtml(task.why_needs_review || "")}</p>
      <h3>Suggested action</h3>
      <p>${escapeHtml(task.suggested_action || "")}</p>
      ${task.notes ? `<h3>Notes</h3><p>${escapeHtml(task.notes)}</p>` : ""}
    </div>
  `;
}

function currentTaskCivics() {
  return state.data.civicsByTask[state.selectedTaskId] || [];
}

function civicMatchesPanelFilter(civic, task) {
  if (state.civicFilter === "unassigned") {
    return !asString(civic.current_section_number || civic.section_number);
  }
  if (state.civicFilter === "competing") {
    const current = asString(civic.current_section_number || civic.section_number);
    const suggested = asString(task.suggested_section_number);
    return current && suggested && current !== suggested;
  }
  return true;
}

function renderCivicsTab(task) {
  const allRows = currentTaskCivics();
  const rows = allRows.filter((civic) => civicMatchesPanelFilter(civic, task));
  const limited = rows.slice(0, MAX_TABLE_ROWS);
  const controls = `
    <div class="inline-toolbar">
      <button class="${state.civicFilter === "all" ? "active" : ""}" type="button" data-civic-filter="all">All</button>
      <button class="${state.civicFilter === "unassigned" ? "active" : ""}" type="button" data-civic-filter="unassigned">Unassigned</button>
      <button class="${state.civicFilter === "competing" ? "active" : ""}" type="button" data-civic-filter="competing">Competing</button>
    </div>
  `;
  if (!rows.length) {
    return `${controls}<p class="empty-state">No civics for this filter.</p>`;
  }
  const fields = [
    "access_id",
    "odonimo_raw",
    "civico",
    "esponente",
    "localita",
    "current_section_number",
    "suggested_section_number",
    "assignment_method",
    "assignment_confidence",
    "rule_id",
    "human_review_required",
    "distance_to_boundary_m",
    "notes",
  ];
  return `
    ${controls}
    <p class="table-note">Showing ${numberLabel(limited.length)} of ${numberLabel(rows.length)} civics. ${escapeHtml(task.civic_range_summary || "")}</p>
    ${renderTable(fields, limited, (row) => `data-access-id="${escapeHtml(row.access_id)}"`)}
  `;
}

function renderStreetTab(task) {
  const rows = state.data.streetEvidenceByTask[task.task_id] || [];
  if (!rows.length) {
    return `
      <div class="evidence-empty">
        <h3>No clear street-register match</h3>
        <p>The parsed electoral street register has no direct or same-street rule for this task. Keep the task in review unless QGIS/PDF inspection resolves it.</p>
      </div>
    `;
  }
  const pdfPath = state.data.summary?.street_register_pdf || "";
  const fields = [
    "rule_id",
    "section_number",
    "street_name_raw",
    "civic_rule_raw",
    "source_page",
    "extraction_confidence",
    "match_reason",
    "relevance_score",
    "pdf",
  ];
  const enriched = rows.map((row) => ({
    ...row,
    pdf: pdfPath && row.source_page ? `<a href="${escapeHtml(pdfPath)}#page=${escapeHtml(row.source_page)}" target="_blank" rel="noreferrer">Open page ${escapeHtml(row.source_page)}</a>` : "PDF not copied",
  }));
  return `
    <div class="register-status">
      ${evidenceBadge(task)}
      <span>${numberLabel(rows.length)} relevant parsed rules</span>
    </div>
    ${renderTable(fields, enriched, null, { allowHtmlFields: new Set(["pdf"]) })}
  `;
}

function renderSectionsTab(task) {
  const rows = state.data.candidateSectionsByTask[task.task_id] || [];
  if (!rows.length) return `<p class="empty-state">No candidate-section summary for this task.</p>`;
  const cards = rows.map((row) => `
    <article class="section-card">
      <div class="section-card-head">
        <strong>Section ${escapeHtml(row.section_number)}</strong>
        <span>${numberLabel(row.civic_support_count)} civics (${numberLabel(asNumber(row.civic_support_share) * 100, 1)}%)</span>
      </div>
      <div class="badge-row">
        ${row.is_suggested ? badge("Suggested", "section") : ""}
        ${row.is_competing ? badge("Competing", "medium") : ""}
        ${row.boundary_warning ? badge("Boundary warning", "high") : ""}
      </div>
      ${factGrid([
        ["Street-register rules", row.street_register_rule_count],
        ["Nearby deterministic points", row.nearby_deterministic_count],
      ])}
    </article>
  `).join("");
  return `<div class="section-grid">${cards}</div>`;
}

function renderNearbyTab(task) {
  const rows = state.data.nearbyByTask[task.task_id] || [];
  if (!rows.length) {
    return `<p class="empty-state">No nearby deterministic sample was exported for this task.</p>`;
  }
  const fields = ["access_id", "odonimo_raw", "civico", "section_number", "assignment_method", "assignment_confidence", "distance_m"];
  return `
    <div class="inline-toolbar">
      <button id="nearbyMapButton" type="button">Show on map</button>
    </div>
    ${renderTable(fields, rows)}
  `;
}

function renderDecisionTab(task) {
  const template = document.getElementById("decisionFormTemplate");
  const wrapper = document.createElement("div");
  wrapper.appendChild(template.content.cloneNode(true));
  const form = wrapper.querySelector("form");
  const decision = taskDecision(task.task_id);
  if (decision) {
    for (const [key, value] of Object.entries(decision)) {
      const field = form.elements[key];
      if (!field) continue;
      if (field.type === "checkbox") field.checked = value === true || value === "true";
      else field.value = value ?? "";
    }
  } else {
    form.elements.review_date.valueAsDate = new Date();
    form.elements.proposed_section_number.value = task.suggested_section_number || "";
  }
  return wrapper.innerHTML;
}

function renderActiveTab() {
  const task = selectedTask();
  if (!task) return;
  if (state.activeTab === "summary") el.tabPanel.innerHTML = renderSummaryTab(task);
  if (state.activeTab === "civics") el.tabPanel.innerHTML = renderCivicsTab(task);
  if (state.activeTab === "street") el.tabPanel.innerHTML = renderStreetTab(task);
  if (state.activeTab === "sections") el.tabPanel.innerHTML = renderSectionsTab(task);
  if (state.activeTab === "nearby") el.tabPanel.innerHTML = renderNearbyTab(task);
  if (state.activeTab === "decision") el.tabPanel.innerHTML = renderDecisionTab(task);
  wireTabPanelEvents();
}

function renderTable(fields, rows, rowAttrs = null, options = {}) {
  const allowHtmlFields = options.allowHtmlFields || new Set();
  const head = fields.map((field) => `<th>${escapeHtml(titleCase(field))}</th>`).join("");
  const body = rows.map((row) => {
    const attrs = rowAttrs ? rowAttrs(row) : "";
    const cells = fields.map((field) => {
      const value = row[field] ?? "";
      return `<td>${allowHtmlFields.has(field) ? value : escapeHtml(value)}</td>`;
    }).join("");
    return `<tr ${attrs}>${cells}</tr>`;
  }).join("");
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function decisionSnapshot(task) {
  const rules = (state.data.streetEvidenceByTask[task.task_id] || []).slice(0, 8).map((row) => ({
    rule_id: row.rule_id,
    section_number: row.section_number,
    source_page: row.source_page,
    match_reason: row.match_reason,
    relevance_score: row.relevance_score,
  }));
  const candidates = (state.data.candidateSectionsByTask[task.task_id] || []).slice(0, 12);
  return JSON.stringify({
    task_title: task.title,
    evidence_strength: task.evidence_strength,
    street_register_match_status: task.street_register_match_status,
    civic_count: task.civic_count,
    civic_range_summary: task.civic_range_summary,
    street_rules: rules,
    candidate_sections: candidates,
  });
}

function saveDecision(event) {
  event.preventDefault();
  const task = selectedTask();
  if (!task) return;
  const form = event.currentTarget;
  const data = new FormData(form);
  const decision = {
    review_id: task.task_id,
    task_id: task.task_id,
    case_type: task.task_type,
    census_cell_id: asString(task.census_cell_id),
    involved_streets: asArray(task.involved_streets).join(";"),
    current_assignment_method: asString(task.unresolved_reason),
    current_assigned_section: "",
    suggested_section_number: asString(task.suggested_section_number),
    competing_sections: asArray(task.competing_sections).join(";"),
    proposed_section_number: asString(data.get("proposed_section_number")),
    decision_type: asString(data.get("decision_type")),
    decision_confidence: asString(data.get("decision_confidence")),
    reason: asString(data.get("reason")),
    qgis_observation: asString(data.get("qgis_observation")),
    reviewed_by: asString(data.get("reviewed_by")),
    review_date: asString(data.get("review_date")),
    requires_follow_up: form.elements.requires_follow_up.checked,
    notes: asString(data.get("notes")),
    evidence_snapshot: decisionSnapshot(task),
    saved_at: new Date().toISOString(),
  };
  state.decisions[task.task_id] = decision;
  persistDecisions();
  applyFilters();
}

function clearDecision() {
  const task = selectedTask();
  if (!task) return;
  delete state.decisions[task.task_id];
  persistDecisions();
  renderSelectedTask();
  renderTaskList();
  renderSummaryStrip();
}

function wireTabPanelEvents() {
  const form = el.tabPanel.querySelector("#decisionForm");
  if (form) form.addEventListener("submit", saveDecision);
  const clearButton = el.tabPanel.querySelector("#clearDecisionButton");
  if (clearButton) clearButton.addEventListener("click", clearDecision);
  for (const button of el.tabPanel.querySelectorAll("[data-civic-filter]")) {
    button.addEventListener("click", () => {
      state.civicFilter = button.dataset.civicFilter;
      renderActiveTab();
    });
  }
  for (const row of el.tabPanel.querySelectorAll("tr[data-access-id]")) {
    row.addEventListener("click", () => focusCivic(row.dataset.accessId));
  }
  const nearbyButton = el.tabPanel.querySelector("#nearbyMapButton");
  if (nearbyButton) {
    nearbyButton.addEventListener("click", () => {
      state.showNearby = true;
      refreshMap();
    });
  }
}

function downloadFile(name, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportDecision(decision) {
  const row = {};
  for (const field of EXPORT_FIELDS) {
    row[field] = decision[field] ?? "";
  }
  return row;
}

function exportJson() {
  const decisions = Object.values(state.decisions).map(exportDecision);
  const payload = {
    exported_at: new Date().toISOString(),
    source_commit: state.data.summary?.source_commit || "",
    decision_model_version: "v2-task-oriented",
    decision_count: decisions.length,
    decisions,
  };
  downloadFile("electoral_sections_v3_manual_review_decisions_v2.json", "application/json", JSON.stringify(payload, null, 2));
  state.dirtySinceExport = false;
}

function csvEscape(value) {
  const text = asString(value);
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function exportCsv() {
  const rows = Object.values(state.decisions).map((decision) => {
    const exported = exportDecision(decision);
    return EXPORT_FIELDS.map((field) => csvEscape(exported[field])).join(",");
  });
  downloadFile("electoral_sections_v3_manual_review_decisions_v2.csv", "text/csv", `${EXPORT_FIELDS.join(",")}\n${rows.join("\n")}\n`);
  state.dirtySinceExport = false;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted && char === '"' && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value !== "")) rows.push(row);
  const [headers = [], ...records] = rows;
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

async function importDecisions() {
  const file = el.importDecisionFile.files?.[0];
  if (!file) return;
  const text = await file.text();
  const parsed = file.name.toLowerCase().endsWith(".json") ? JSON.parse(text) : null;
  const rows = parsed ? parsed.decisions || parsed : parseCsv(text);
  for (const row of rows) {
    const taskId = row.task_id || row.review_id;
    if (!taskId) continue;
    state.decisions[taskId] = {
      ...row,
      review_id: row.review_id || taskId,
      task_id: taskId,
      requires_follow_up: row.requires_follow_up === true || asString(row.requires_follow_up).toLowerCase() === "true",
      imported_at: new Date().toISOString(),
    };
  }
  persistDecisions();
  applyFilters();
}

function leafletAvailable() {
  return typeof window.L !== "undefined" && el.mapCanvas;
}

function geoJsonBounds(collection) {
  if (!collection || !collection.features?.length || !leafletAvailable()) return null;
  return window.L.geoJSON(collection).getBounds();
}

function fitInitialMap() {
  if (!state.map) return;
  let bounds = geoJsonBounds(state.data.sectionsV3);
  const cellBounds = geoJsonBounds(state.data.reviewCells);
  if (cellBounds?.isValid()) bounds = bounds?.isValid() ? bounds.extend(cellBounds) : cellBounds;
  if (bounds?.isValid()) state.map.fitBounds(bounds.pad(0.05));
  else state.map.setView([38.96, 16.31], 12);
}

function initMap() {
  if (!leafletAvailable()) {
    state.mapMode = "fallback";
    el.mapCanvas.hidden = true;
    el.fallbackMap.hidden = false;
    renderFallbackMap();
    el.mapStatus.textContent = "Leaflet unavailable; showing local geometry fallback.";
    return;
  }
  state.mapMode = "leaflet";
  el.fallbackMap.hidden = true;
  el.mapCanvas.hidden = false;
  state.map = window.L.map(el.mapCanvas, { preferCanvas: true, zoomControl: true });
  state.osmLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
  if (el.toggles.osm.checked) state.osmLayer.addTo(state.map);
  state.leafletLayers = {
    sectionsV3: window.L.layerGroup().addTo(state.map),
    sectionsV2: window.L.layerGroup(),
    cells: window.L.layerGroup().addTo(state.map),
    reviewPoints: window.L.layerGroup().addTo(state.map),
    resolvedPoints: window.L.layerGroup(),
    deterministicPoints: window.L.layerGroup(),
    selected: window.L.layerGroup().addTo(state.map),
    nearby: window.L.layerGroup(),
    competing: window.L.layerGroup(),
  };
  state.map.on("moveend", () => {
    if (el.filters.visibleExtent.checked) applyFilters({ keepSelection: true });
  });
  fitInitialMap();
  refreshMap();
}

function layerVisible(name) {
  const layer = state.leafletLayers[name];
  return state.map && layer && state.map.hasLayer(layer);
}

function setLayerVisibility(name, visible) {
  const layer = state.leafletLayers[name];
  if (!state.map || !layer) return;
  if (visible && !state.map.hasLayer(layer)) layer.addTo(state.map);
  if (!visible && state.map.hasLayer(layer)) state.map.removeLayer(layer);
}

function popupForProperties(properties) {
  const rows = Object.entries(properties || {})
    .filter(([, value]) => value !== "" && value !== null && value !== undefined)
    .slice(0, 9)
    .map(([key, value]) => `<dt>${escapeHtml(titleCase(key))}</dt><dd>${escapeHtml(value)}</dd>`)
    .join("");
  return `<dl class="popup-facts">${rows}</dl>`;
}

function sectionStyle(feature) {
  const section = asString(feature.properties?.section_number);
  const task = selectedTask();
  const candidates = state.data.candidateSectionsByTask[task?.task_id || ""] || [];
  const selected = candidates.some((row) => asString(row.section_number) === section);
  return {
    color: selected ? "#244f8f" : "#18745f",
    weight: selected ? 3 : 1.4,
    fillOpacity: selected ? 0.16 : 0.08,
    fillColor: selected ? "#7fb0ff" : "#56b696",
  };
}

function v2Style() {
  return { color: "#7955b8", weight: 1.2, fillOpacity: 0, dashArray: "5 5" };
}

function cellStyle(feature) {
  const taskIds = splitList(feature.properties?.review_task_ids);
  const selected = taskIds.includes(state.selectedTaskId);
  return {
    color: selected ? "#a52e2e" : "#b75d1e",
    weight: selected ? 3 : 1.2,
    fillOpacity: selected ? 0.24 : 0.15,
    fillColor: "#f2a35e",
  };
}

function pointColor(feature) {
  const pointType = asString(feature.properties?.point_type);
  if (pointType === "boundary_uncertainty_point") return "#d9573f";
  return "#6d7480";
}

function addGeoJsonLayer(group, collection, options) {
  group.clearLayers();
  window.L.geoJSON(collection, options).addTo(group);
}

function drawLeafletBaseLayers() {
  if (!state.map) return;
  if (el.toggles.osm.checked) {
    if (!state.map.hasLayer(state.osmLayer)) state.osmLayer.addTo(state.map);
  } else if (state.map.hasLayer(state.osmLayer)) {
    state.map.removeLayer(state.osmLayer);
  }
  addGeoJsonLayer(state.leafletLayers.sectionsV3, state.data.sectionsV3, {
    style: sectionStyle,
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(`V3 section ${feature.properties?.section_number || ""}`);
      layer.bindPopup(popupForProperties(feature.properties));
      layer.on("click", () => selectTaskForSection(feature.properties?.section_number));
    },
  });
  addGeoJsonLayer(state.leafletLayers.sectionsV2, state.data.sectionsV2, {
    style: v2Style,
    onEachFeature: (feature, layer) => layer.bindTooltip(`V2 section ${feature.properties?.section_number || ""}`),
  });
  addGeoJsonLayer(state.leafletLayers.cells, state.data.reviewCells, {
    style: cellStyle,
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(`Cell ${feature.properties?.census_cell_id || ""}`);
      layer.bindPopup(popupForProperties(feature.properties));
      layer.on("click", () => {
        const taskId = splitList(feature.properties?.review_task_ids)[0];
        if (taskId) selectTask(taskId);
      });
    },
  });
  addGeoJsonLayer(state.leafletLayers.reviewPoints, state.data.reviewPoints, {
    filter: (feature) => {
      const pointType = asString(feature.properties?.point_type);
      if (pointType === "boundary_uncertainty_point" && !el.toggles.boundaryPoints.checked) return false;
      if (pointType !== "boundary_uncertainty_point" && !el.toggles.reviewPoints.checked) return false;
      return true;
    },
    pointToLayer: (feature, latlng) => window.L.circleMarker(latlng, {
      radius: feature.properties?.task_id === state.selectedTaskId ? 7 : 4,
      color: "#ffffff",
      weight: 1,
      fillColor: pointColor(feature),
      fillOpacity: feature.properties?.task_id === state.selectedTaskId ? 0.95 : 0.72,
    }),
    onEachFeature: (feature, layer) => {
      const props = feature.properties || {};
      layer.bindTooltip(`${props.ODONIMO || ""} ${props.CIVICO || ""} sec ${props.section_number || ""}`);
      layer.bindPopup(popupForProperties(props));
      layer.on("click", () => {
        if (props.task_id) selectTask(props.task_id);
      });
    },
  });
  addGeoJsonLayer(state.leafletLayers.resolvedPoints, state.data.resolvedPoints, {
    pointToLayer: (_feature, latlng) => window.L.circleMarker(latlng, {
      radius: 3,
      color: "#ffffff",
      weight: 0.8,
      fillColor: "#3273a8",
      fillOpacity: 0.55,
    }),
    onEachFeature: (feature, layer) => layer.bindTooltip(`Resolved ${feature.properties?.ODONIMO || ""} ${feature.properties?.CIVICO || ""}`),
  });
  addGeoJsonLayer(state.leafletLayers.deterministicPoints, state.data.deterministicPoints, {
    pointToLayer: (_feature, latlng) => window.L.circleMarker(latlng, {
      radius: 2.6,
      color: "#ffffff",
      weight: 0.6,
      fillColor: "#25865f",
      fillOpacity: 0.48,
    }),
    onEachFeature: (feature, layer) => layer.bindTooltip(`Deterministic sec ${feature.properties?.section_number || ""}`),
  });
  setLayerVisibility("sectionsV3", el.toggles.v3.checked);
  setLayerVisibility("sectionsV2", el.toggles.v2.checked);
  setLayerVisibility("cells", el.toggles.cells.checked);
  setLayerVisibility("reviewPoints", el.toggles.reviewPoints.checked || el.toggles.boundaryPoints.checked);
  setLayerVisibility("resolvedPoints", el.toggles.resolvedPoints.checked);
  setLayerVisibility("deterministicPoints", el.toggles.deterministicPoints.checked);
}

function selectTaskForSection(sectionNumber) {
  const task = state.tasks.find((item) => {
    if (item.task_type !== "section_low_confidence" && item.task_type !== "section_needs_manual_review") return false;
    return asString(item.suggested_section_number) === asString(sectionNumber);
  });
  if (task) selectTask(task.task_id);
}

function civicLatLng(civic) {
  const lon = Number(civic.coord_x);
  const lat = Number(civic.coord_y);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return [lat, lon];
}

function renderSelectedLeaflet() {
  if (!state.map) return;
  state.leafletLayers.selected.clearLayers();
  state.leafletLayers.nearby.clearLayers();
  state.leafletLayers.competing.clearLayers();
  const task = selectedTask();
  if (!task) return;
  const civics = currentTaskCivics();
  for (const civic of civics) {
    const latlng = civicLatLng(civic);
    if (!latlng) continue;
    const marker = window.L.circleMarker(latlng, {
      radius: civic.access_id === state.selectedCivicAccessId ? 8 : 5,
      color: civic.access_id === state.selectedCivicAccessId ? "#111827" : "#ffffff",
      weight: civic.access_id === state.selectedCivicAccessId ? 2 : 1,
      fillColor: "#f05a45",
      fillOpacity: 0.9,
    });
    marker.bindTooltip(`${civic.odonimo_raw || ""} ${civic.civico || ""}`);
    marker.bindPopup(popupForProperties(civic));
    marker.on("click", () => focusCivic(civic.access_id, { zoom: false }));
    marker.addTo(state.leafletLayers.selected);
  }
  if (state.showNearby) {
    for (const civic of state.data.nearbyByTask[task.task_id] || []) {
      const latlng = civicLatLng(civic);
      if (!latlng) continue;
      window.L.circleMarker(latlng, {
        radius: 4,
        color: "#ffffff",
        weight: 1,
        fillColor: "#278260",
        fillOpacity: 0.7,
      }).bindTooltip(`Nearby deterministic sec ${civic.section_number || ""}`).addTo(state.leafletLayers.nearby);
    }
    setLayerVisibility("nearby", true);
  } else {
    setLayerVisibility("nearby", false);
  }
  if (state.showCompeting) {
    const candidateSections = new Set((state.data.candidateSectionsByTask[task.task_id] || []).map((row) => asString(row.section_number)));
    const features = {
      type: "FeatureCollection",
      features: (state.data.sectionsV3.features || []).filter((feature) => candidateSections.has(asString(feature.properties?.section_number))),
    };
    window.L.geoJSON(features, {
      style: { color: "#244f8f", weight: 4, fillColor: "#7fb0ff", fillOpacity: 0.18 },
      onEachFeature: (feature, layer) => layer.bindTooltip(`Candidate section ${feature.properties?.section_number || ""}`),
    }).addTo(state.leafletLayers.competing);
    setLayerVisibility("competing", true);
  } else {
    setLayerVisibility("competing", false);
  }
}

function zoomToSelectedTask() {
  const task = selectedTask();
  if (!task || !task.map_focus_bbox?.length) return;
  if (state.map && typeof window.L !== "undefined") {
    const [minX, minY, maxX, maxY] = task.map_focus_bbox;
    state.map.fitBounds(window.L.latLngBounds([minY, minX], [maxY, maxX]), { padding: [28, 28] });
  } else {
    renderFallbackMap();
  }
}

function focusCivic(accessId, options = {}) {
  state.selectedCivicAccessId = accessId;
  const civic = currentTaskCivics().find((row) => row.access_id === accessId);
  renderActiveTab();
  refreshMap();
  if (options.zoom === false || !civic || !state.map) return;
  const latlng = civicLatLng(civic);
  if (latlng) state.map.setView(latlng, Math.max(state.map.getZoom(), 18));
}

function refreshMap() {
  if (state.mapMode === "leaflet") {
    drawLeafletBaseLayers();
    renderSelectedLeaflet();
    el.mapStatus.textContent = el.toggles.osm.checked ? "OpenStreetMap basemap is visual context only." : "OSM hidden; local geometries remain visible.";
    window.setTimeout(() => { el.mapStatus.textContent = ""; }, 1600);
    return;
  }
  renderFallbackMap();
}

function featureCoordinates(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Point") return [geometry.coordinates];
  if (geometry.type === "MultiPoint" || geometry.type === "LineString") return geometry.coordinates;
  if (geometry.type === "MultiLineString" || geometry.type === "Polygon") return geometry.coordinates.flat(1);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(2);
  return [];
}

function bboxForFeature(feature) {
  const coords = featureCoordinates(feature.geometry);
  if (!coords.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of coords) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

function mergeBBox(a, b) {
  if (!a) return b;
  if (!b) return a;
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

function calculateFallbackBBox() {
  let bbox = null;
  for (const collection of [state.data.sectionsV3, state.data.reviewCells, state.data.reviewPoints]) {
    for (const feature of collection.features || []) bbox = mergeBBox(bbox, bboxForFeature(feature));
  }
  if (!bbox) return null;
  const padX = (bbox.maxX - bbox.minX) * 0.04 || 0.01;
  const padY = (bbox.maxY - bbox.minY) * 0.04 || 0.01;
  return { minX: bbox.minX - padX, minY: bbox.minY - padY, maxX: bbox.maxX + padX, maxY: bbox.maxY + padY };
}

function projectFactory(bbox, width, height) {
  const dx = bbox.maxX - bbox.minX || 1;
  const dy = bbox.maxY - bbox.minY || 1;
  const scale = Math.min(width / dx, height / dy);
  const drawnWidth = dx * scale;
  const drawnHeight = dy * scale;
  const offsetX = (width - drawnWidth) / 2;
  const offsetY = (height - drawnHeight) / 2;
  return ([x, y]) => [offsetX + (x - bbox.minX) * scale, offsetY + (bbox.maxY - y) * scale];
}

function ringPath(ring, project) {
  return ring.map((coord, index) => {
    const [x, y] = project(coord);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ") + " Z";
}

function geometryPath(geometry, project) {
  if (!geometry) return "";
  if (geometry.type === "Polygon") return geometry.coordinates.map((ring) => ringPath(ring, project)).join(" ");
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flatMap((poly) => poly.map((ring) => ringPath(ring, project))).join(" ");
  return "";
}

function renderFallbackMap() {
  const width = 1000;
  const height = 760;
  state.fallbackBBox = state.fallbackBBox || calculateFallbackBBox();
  if (!state.fallbackBBox) {
    el.mapStatus.textContent = "No local map data loaded.";
    return;
  }
  const task = selectedTask();
  const bbox = task?.map_focus_bbox?.length
    ? { minX: task.map_focus_bbox[0], minY: task.map_focus_bbox[1], maxX: task.map_focus_bbox[2], maxY: task.map_focus_bbox[3] }
    : state.fallbackBBox;
  const project = projectFactory(bbox, width, height);
  const paths = [];
  if (el.toggles.v3.checked) {
    for (const feature of state.data.sectionsV3.features || []) {
      const path = geometryPath(feature.geometry, project);
      if (path) paths.push(`<path class="fallback-section" d="${path}"><title>V3 section ${escapeHtml(feature.properties?.section_number || "")}</title></path>`);
    }
  }
  if (el.toggles.cells.checked) {
    for (const feature of state.data.reviewCells.features || []) {
      const selected = splitList(feature.properties?.review_task_ids).includes(state.selectedTaskId);
      const path = geometryPath(feature.geometry, project);
      if (path) paths.push(`<path class="fallback-cell${selected ? " selected" : ""}" d="${path}"></path>`);
    }
  }
  for (const feature of state.data.reviewPoints.features || []) {
    if (!feature.geometry || feature.geometry.type !== "Point") continue;
    if (feature.properties?.task_id !== state.selectedTaskId && !el.toggles.reviewPoints.checked) continue;
    const [x, y] = project(feature.geometry.coordinates);
    const selected = feature.properties?.task_id === state.selectedTaskId;
    paths.push(`<circle class="fallback-point${selected ? " selected" : ""}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${selected ? 5 : 2.8}"></circle>`);
  }
  el.fallbackMap.setAttribute("viewBox", `0 0 ${width} ${height}`);
  el.fallbackMap.innerHTML = paths.join("");
  el.mapStatus.textContent = "Local geometry fallback. OSM basemap is not active.";
}

function wireEvents() {
  el.taskList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-task-id]");
    if (card) selectTask(card.dataset.taskId);
  });
  for (const filter of Object.values(el.filters)) {
    const eventName = filter.type === "checkbox" || filter.tagName === "SELECT" ? "change" : "input";
    filter.addEventListener(eventName, () => applyFilters({ keepSelection: true }));
  }
  for (const toggle of Object.values(el.toggles)) {
    toggle.addEventListener("change", refreshMap);
  }
  document.querySelectorAll(".tabs [data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      document.querySelectorAll(".tabs [data-tab]").forEach((item) => item.classList.toggle("active", item === button));
      renderActiveTab();
    });
  });
  el.zoomSelectedButton.addEventListener("click", zoomToSelectedTask);
  el.showNearbyButton.addEventListener("click", () => {
    state.showNearby = !state.showNearby;
    refreshMap();
  });
  el.showCompetingButton.addEventListener("click", () => {
    state.showCompeting = !state.showCompeting;
    refreshMap();
  });
  el.importDecisionButton.addEventListener("click", importDecisions);
  el.exportJsonButton.addEventListener("click", exportJson);
  el.exportCsvButton.addEventListener("click", exportCsv);
  window.addEventListener("beforeunload", (event) => {
    if (!state.dirtySinceExport) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

async function boot() {
  loadDecisions();
  wireEvents();
  const [
    summary,
    tasks,
    reviewCells,
    sectionsV3,
    sectionsV2,
    reviewPoints,
    resolvedPoints,
    deterministicPoints,
    civicsByTask,
    streetEvidenceByTask,
    candidateSectionsByTask,
    nearbyByTask,
  ] = await Promise.all([
    fetchJson("review_summary.json"),
    fetchJson("review_tasks.json"),
    fetchJson("review_cells.geojson"),
    fetchJson("candidate_sections_v3.geojson"),
    fetchJson("candidate_sections_v2.geojson"),
    fetchJson("review_points.geojson"),
    fetchJson("spatially_resolved_points.geojson"),
    fetchJson("deterministic_points_sample.geojson"),
    fetchJson("civics_by_task.json"),
    fetchJson("street_register_evidence_by_task.json"),
    fetchJson("candidate_sections_by_task.json"),
    fetchJson("nearby_deterministic_by_task.json"),
  ]);
  state.data = {
    summary,
    reviewCells,
    sectionsV3,
    sectionsV2,
    reviewPoints,
    resolvedPoints,
    deterministicPoints,
    civicsByTask,
    streetEvidenceByTask,
    candidateSectionsByTask,
    nearbyByTask,
  };
  state.tasks = tasks;
  state.filteredTasks = tasks;
  state.selectedTaskId = tasks[0]?.task_id || "";
  populateFilters();
  renderSummaryStrip();
  renderTaskList();
  renderSelectedTask();
  initMap();
}

boot().catch((error) => {
  console.error(error);
  el.summaryStrip.innerHTML = `<span>Dataset load failed</span>`;
  el.mapStatus.textContent = error.message;
});
