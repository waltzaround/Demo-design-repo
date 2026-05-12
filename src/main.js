const STORAGE_KEY = "demo-design-repo-todos";

/** @typedef {{ id: string, text: string, done: boolean }} Todo */

/** @returns {Todo[]} */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) =>
        t &&
        typeof t.id === "string" &&
        typeof t.text === "string" &&
        typeof t.done === "boolean",
    );
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

const form = document.getElementById("add-form");
const input = document.getElementById("new-text");
const list = document.getElementById("todo-list");
const empty = document.getElementById("empty");

if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement) || !list || !empty) {
  throw new Error("Missing required DOM nodes");
}

/** @type {Todo[]} */
let todos = loadTodos();

function persist() {
  saveTodos(todos);
}

function render() {
  list.replaceChildren();
  empty.hidden = todos.length > 0;

  for (const todo of todos) {
    const li = document.createElement("li");
    li.dataset.id = todo.id;
    li.dataset.done = String(todo.done);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.setAttribute("aria-label", `Done: ${todo.text}`);

    const label = document.createElement("label");
    label.htmlFor = `todo-${todo.id}`;
    label.textContent = todo.text;

    checkbox.id = `todo-${todo.id}`;

    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "Remove";
    del.setAttribute("aria-label", `Remove: ${todo.text}`);

    li.append(checkbox, label, del);
    list.append(li);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ id: newId(), text, done: false });
  input.value = "";
  persist();
  render();
  input.focus();
});

list.addEventListener("change", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;
  const li = target.closest("li");
  if (!li?.dataset.id) return;
  const id = li.dataset.id;
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.done = target.checked;
  li.dataset.done = String(todo.done);
  persist();
});

list.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const li = target.closest("li");
  if (!li?.dataset.id) return;
  const id = li.dataset.id;
  todos = todos.filter((t) => t.id !== id);
  persist();
  render();
});

render();
