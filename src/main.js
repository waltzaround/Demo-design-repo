/* ─────────────────────────────────────────────────────────
   Surprise & Delight — Todos
   Vanilla JS, persisted in localStorage.
   ───────────────────────────────────────────────────────── */
const STORAGE_KEY = "demo-design-repo-todos";

/** @typedef {{ id: string, text: string, done: boolean, tag?: string, createdAt?: number }} Todo */

const VALID_TAGS = new Set(["heart", "sip", "treat", "slice"]);

/** @returns {Todo[]} */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (t) =>
          t &&
          typeof t.id === "string" &&
          typeof t.text === "string" &&
          typeof t.done === "boolean",
      )
      .map((t) => ({
        id: t.id,
        text: t.text,
        done: t.done,
        tag: typeof t.tag === "string" && VALID_TAGS.has(t.tag) ? t.tag : undefined,
        createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
      }));
  } catch {
    return [];
  }
}

/** @param {Todo[]} todos */
function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function newId() {
  return crypto.randomUUID();
}

/* ─── DOM refs ──────────────────────────────────────── */
const form = /** @type {HTMLFormElement} */ (document.getElementById("add-form"));
const input = /** @type {HTMLInputElement} */ (document.getElementById("new-text"));
const list = /** @type {HTMLUListElement} */ (document.getElementById("todo-list"));
const empty = /** @type {HTMLElement} */ (document.getElementById("empty"));
const emptyTitle = document.getElementById("empty-title");
const emptySub = document.getElementById("empty-sub");
const tpl = /** @type {HTMLTemplateElement} */ (document.getElementById("tpl-todo"));
const search = /** @type {HTMLInputElement} */ (document.getElementById("search"));
const filterBtns = /** @type {NodeListOf<HTMLButtonElement>} */ (
  document.querySelectorAll(".filter")
);
const clearDoneBtn = /** @type {HTMLButtonElement} */ (document.getElementById("clear-done"));
const progressLabel = /** @type {HTMLElement} */ (document.getElementById("progress-label"));
const progressSub = /** @type {HTMLElement} */ (document.getElementById("progress-sub"));
const progressRing = /** @type {SVGCircleElement} */ (document.getElementById("progress-ring"));
const progressPct = /** @type {HTMLElement} */ (document.getElementById("progress-pct"));
const brandDate = /** @type {HTMLElement} */ (document.getElementById("brand-date"));
const countAll = /** @type {HTMLElement} */ (document.getElementById("count-all"));
const countActive = /** @type {HTMLElement} */ (document.getElementById("count-active"));
const countDone = /** @type {HTMLElement} */ (document.getElementById("count-done"));
const toast = /** @type {HTMLElement} */ (document.getElementById("toast"));
const toastText = /** @type {HTMLElement} */ (document.getElementById("toast-text"));
const toastUndo = /** @type {HTMLButtonElement} */ (document.getElementById("toast-undo"));

if (!form || !input || !list || !empty || !tpl) {
  throw new Error("Missing required DOM nodes");
}

/* ─── State ─────────────────────────────────────────── */
/** @type {Todo[]} */
let todos = loadTodos();
/** @type {"all"|"active"|"done"} */
let filter = "all";
let query = "";

/** @type {{ todo: Todo, index: number } | null} */
let lastDeleted = null;
let toastTimer = 0;

/* ─── Date string ───────────────────────────────────── */
brandDate.textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

/* ─── Helpers ───────────────────────────────────────── */
function persist() {
  saveTodos(todos);
}

function getSelectedTag() {
  const el = /** @type {HTMLInputElement | null} */ (
    form.querySelector('input[name="tag"]:checked')
  );
  return el && VALID_TAGS.has(el.value) ? el.value : "";
}

function resetTagSelection() {
  const none = /** @type {HTMLInputElement | null} */ (form.querySelector("#tag-none"));
  if (none) none.checked = true;
}

function visibleTodos() {
  const q = query.trim().toLowerCase();
  return todos.filter((t) => {
    if (filter === "active" && t.done) return false;
    if (filter === "done" && !t.done) return false;
    if (q && !t.text.toLowerCase().includes(q)) return false;
    return true;
  });
}

const tagLabels = {
  heart: "love",
  sip: "sip",
  treat: "treat",
  slice: "slice",
};

const encouragements = [
  "sweet little wins ahead.",
  "look at you go.",
  "keep nibbling away.",
  "halfway there — treat time soon.",
  "almost done — save the cake.",
  "one more bite.",
  "all done — go celebrate!",
];

function pickEncouragement(pct, total, doneCount) {
  if (total === 0) return "add your first sweet little win";
  if (doneCount === total) return encouragements[6];
  if (pct >= 80) return encouragements[5];
  if (pct >= 60) return encouragements[4];
  if (pct >= 40) return encouragements[3];
  if (pct >= 20) return encouragements[2];
  if (doneCount > 0) return encouragements[1];
  return encouragements[0];
}

/* ─── Rendering ─────────────────────────────────────── */
function render() {
  // Counts
  const total = todos.length;
  const doneCount = todos.filter((t) => t.done).length;
  const activeCount = total - doneCount;

  countAll.textContent = String(total);
  countActive.textContent = String(activeCount);
  countDone.textContent = String(doneCount);

  // Progress
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const circumference = 2 * Math.PI * 25; // r = 25
  progressRing.setAttribute("stroke-dasharray", String(circumference));
  progressRing.setAttribute(
    "stroke-dashoffset",
    String(circumference - (pct / 100) * circumference),
  );
  progressPct.textContent = `${pct}%`;
  progressLabel.textContent =
    total === 0
      ? "no tasks yet"
      : doneCount === total
        ? "all done — sweet!"
        : `${doneCount} of ${total} done`;
  progressSub.textContent = pickEncouragement(pct, total, doneCount);

  // Clear-done visibility
  clearDoneBtn.hidden = doneCount === 0;

  // List
  const items = visibleTodos();
  list.replaceChildren();

  if (items.length === 0) {
    empty.hidden = false;
    if (total === 0) {
      emptyTitle.textContent = "your list is fresh and warm";
      emptySub.textContent = "start with something delicious — even small wins count.";
    } else if (query) {
      emptyTitle.textContent = "no matches found";
      emptySub.textContent = `nothing matches “${query}”. try another word?`;
    } else if (filter === "active") {
      emptyTitle.textContent = "all caught up";
      emptySub.textContent = "every task here is done. enjoy a treat.";
    } else if (filter === "done") {
      emptyTitle.textContent = "nothing finished yet";
      emptySub.textContent = "tick off your first task to fill this space.";
    }
  } else {
    empty.hidden = true;
    for (const todo of items) {
      list.append(createTodoNode(todo));
    }
  }
}

/** @param {Todo} todo */
function createTodoNode(todo) {
  const node = /** @type {HTMLElement} */ (tpl.content.firstElementChild.cloneNode(true));
  node.dataset.id = todo.id;
  node.dataset.done = String(todo.done);

  const check = node.querySelector(".todo__check");
  check.setAttribute("aria-pressed", String(todo.done));
  check.setAttribute("aria-label", todo.done ? `Mark "${todo.text}" as not done` : `Mark "${todo.text}" as done`);

  const text = /** @type {HTMLElement} */ (node.querySelector(".todo__text"));
  text.textContent = todo.text;

  const tagEl = /** @type {HTMLElement} */ (node.querySelector(".todo__tag"));
  if (todo.tag && VALID_TAGS.has(todo.tag)) {
    tagEl.hidden = false;
    tagEl.dataset.tag = todo.tag;
    tagEl.textContent = tagLabels[todo.tag] ?? todo.tag;
  } else {
    tagEl.hidden = true;
  }

  return node;
}

/* ─── Event: add task ───────────────────────────────── */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const tag = getSelectedTag();
  /** @type {Todo} */
  const next = {
    id: newId(),
    text,
    done: false,
    createdAt: Date.now(),
    ...(tag ? { tag } : {}),
  };
  todos.unshift(next);
  input.value = "";
  resetTagSelection();
  persist();
  render();
  input.focus();
});

/* ─── Event: toggle done ────────────────────────────── */
list.addEventListener("click", (e) => {
  const target = /** @type {HTMLElement} */ (e.target);
  const li = target.closest("li");
  if (!li || !(li instanceof HTMLElement) || !li.dataset.id) return;
  const id = li.dataset.id;
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  if (target.closest(".todo__check")) {
    todo.done = !todo.done;
    li.dataset.done = String(todo.done);
    const check = /** @type {HTMLButtonElement} */ (li.querySelector(".todo__check"));
    check.setAttribute("aria-pressed", String(todo.done));
    persist();
    // Re-render to update progress + counts (item stays unless filter hides it)
    render();
    return;
  }

  if (target.closest(".todo__del-btn")) {
    removeWithAnimation(li, todo);
    return;
  }

  if (target.closest(".todo__edit-btn")) {
    enterEditMode(li, todo);
    return;
  }

  // Click on text → also enter edit
  if (target.closest(".todo__text")) {
    enterEditMode(li, todo);
    return;
  }
});

/* ─── Edit mode ─────────────────────────────────────── */
/**
 * @param {HTMLElement} li
 * @param {Todo} todo
 */
function enterEditMode(li, todo) {
  const text = /** @type {HTMLElement} */ (li.querySelector(".todo__text"));
  const editor = /** @type {HTMLInputElement} */ (li.querySelector(".todo__edit"));
  text.hidden = true;
  editor.hidden = false;
  editor.value = todo.text;
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);

  const finish = (commit) => {
    if (commit) {
      const next = editor.value.trim();
      if (next && next !== todo.text) {
        todo.text = next;
        text.textContent = next;
        persist();
      }
    }
    editor.hidden = true;
    text.hidden = false;
    editor.removeEventListener("keydown", onKey);
    editor.removeEventListener("blur", onBlur);
  };
  const onKey = (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      finish(true);
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      finish(false);
    }
  };
  const onBlur = () => finish(true);
  editor.addEventListener("keydown", onKey);
  editor.addEventListener("blur", onBlur);
}

/* ─── Remove with animation + undo ─────────────────── */
/**
 * @param {HTMLElement} li
 * @param {Todo} todo
 */
function removeWithAnimation(li, todo) {
  const index = todos.findIndex((t) => t.id === todo.id);
  if (index === -1) return;
  lastDeleted = { todo, index };
  li.classList.add("is-leaving");
  const cleanup = () => {
    todos = todos.filter((t) => t.id !== todo.id);
    persist();
    render();
    showToast("task removed");
  };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) cleanup();
  else setTimeout(cleanup, 200);
}

/* ─── Toast ─────────────────────────────────────────── */
function showToast(message) {
  toastText.textContent = message;
  toast.hidden = false;
  // Force reflow so transition runs
  void toast.offsetWidth;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(hideToast, 4500);
}
function hideToast() {
  toast.classList.remove("is-visible");
  clearTimeout(toastTimer);
  setTimeout(() => {
    toast.hidden = true;
    lastDeleted = null;
  }, 250);
}
toastUndo.addEventListener("click", () => {
  if (lastDeleted) {
    const { todo, index } = lastDeleted;
    todos.splice(Math.min(index, todos.length), 0, todo);
    persist();
    render();
  }
  hideToast();
});

/* ─── Filters ───────────────────────────────────────── */
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = /** @type {"all"|"active"|"done"} */ (btn.dataset.filter || "all");
    filter = value;
    filterBtns.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });
    render();
  });
});

/* ─── Search ────────────────────────────────────────── */
search.addEventListener("input", () => {
  query = search.value;
  render();
});

/* ─── Clear done ────────────────────────────────────── */
clearDoneBtn.addEventListener("click", () => {
  const removed = todos.filter((t) => t.done);
  if (removed.length === 0) return;
  todos = todos.filter((t) => !t.done);
  persist();
  render();
  showToast(`${removed.length} done task${removed.length === 1 ? "" : "s"} cleared`);
  // No undo for bulk clear (kept simple)
  lastDeleted = null;
});

/* ─── Keyboard shortcuts ────────────────────────────── */
document.addEventListener("keydown", (e) => {
  // "/" to focus search (when not already typing in an input)
  const target = /** @type {HTMLElement} */ (e.target);
  const inField =
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
  if (e.key === "/" && !inField) {
    e.preventDefault();
    search.focus();
    search.select();
  }
  if (e.key === "Escape" && document.activeElement === search) {
    search.value = "";
    query = "";
    render();
    search.blur();
  }
});

/* ─── First paint ───────────────────────────────────── */
render();
