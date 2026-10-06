import {PlansStore} from "./store.mjs";
const $ = id => document.getElementById(id);
let store, active = null, filter = "all";
function run(action) {
  $("error").hidden = true;
  try { action(); }
  catch (error) {
    $("error").textContent = error.name === "QuotaExceededError"
      ? "Browser storage is full. Your change was not saved."
      : error.name === "SecurityError" ? "Browser storage is blocked. Allow site storage to use Plans."
      : error instanceof SyntaxError ? "Saved data could not be read. It has not been overwritten." : error.message;
    $("error").hidden = false;
  }
}
function button(text, className, action) {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = text; b.className = className;
  b.addEventListener("click", () => run(action)); return b;
}
function choose(id) { sessionStorage.setItem("plans.active", id); active = id; filter = "all"; render(); }
function render() {
  const data = store.read();
  const profile = data.profiles.find(p => p.id === active);
  $("welcome").hidden = !!profile; $("dashboard").hidden = !profile;
  if (!profile) {
    active = null;
    $("profiles").replaceChildren(...data.profiles.map(p => button(p.name, "profile-btn", () => choose(p.id))));
    return;
  }
  $("greeting").textContent = "Hey, " + profile.name + "!";
  document.title = profile.name + "'s plans";
  const all = store.list(active);
  const tasks = all.filter(t => filter === "all" || t.done === (filter === "done"));
  $("tasks").replaceChildren();
  for (const task of tasks) {
    const li = document.createElement("li"); li.className = "task" + (task.done ? " is-done" : "");
    const check = button(task.done ? "✓" : "", "check" + (task.done ? " is-done" : ""), () => { store.change(active, task.id, "toggle"); render(); });
    check.setAttribute("aria-label", (task.done ? "Mark as not done: " : "Mark as done: ") + task.title);
    check.setAttribute("aria-pressed", String(task.done));
    const title = document.createElement("span"); title.className = "title"; title.textContent = task.title;
    const remove = button("Delete", "link", () => { store.change(active, task.id, "delete"); render(); });
    remove.setAttribute("aria-label", "Delete " + task.title);
    li.append(check, title, remove); $("tasks").append(li);
  }
  if (!tasks.length) {
    const li = document.createElement("li"); li.className = "empty";
    li.textContent = filter === "done" ? "Nothing finished yet." : filter === "todo" ? "All caught up!" : "No tasks yet. Add your first one above.";
    $("tasks").append(li);
  }
  $("count").textContent = all.filter(t => !t.done).length + " left";
  $("clear").hidden = !all.some(t => t.done);
  document.querySelectorAll("[data-filter]").forEach(b => {
    b.classList.toggle("on", b.dataset.filter === filter);
    b.setAttribute("aria-pressed", String(b.dataset.filter === filter));
  });
}
$("date").textContent = new Date().toLocaleDateString(undefined, {weekday:"long", day:"numeric", month:"long"});
$("profile-form").addEventListener("submit", e => { e.preventDefault(); run(() => {
  const id = store.createProfile($("name").value); $("name").value = ""; choose(id);
}); });
$("add-form").addEventListener("submit", e => { e.preventDefault(); run(() => {
  store.add(active, $("title").value); $("title").value = ""; render(); $("title").focus();
}); });
$("clear").addEventListener("click", () => run(() => { store.clear(active); render(); }));
$("switch").addEventListener("click", () => run(() => { sessionStorage.removeItem("plans.active"); active = null; document.title = "Plans"; render(); }));
document.querySelectorAll("[data-filter]").forEach(b => b.addEventListener("click", () => run(() => { filter = b.dataset.filter; render(); })));
window.addEventListener("storage", e => { if (e.key === "plans.local.v1" || e.key === null) run(render); });
run(() => { store = new PlansStore(localStorage); active = sessionStorage.getItem("plans.active"); render(); });
