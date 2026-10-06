export class PlansStore {
  constructor(storage) { this.storage = storage; this.key = "plans.local.v1"; }
  read() {
    const raw = this.storage.getItem(this.key);
    if (raw === null) return {version: 1, profiles: [], tasks: []};
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.profiles) || !Array.isArray(data.tasks)
      || !data.profiles.every(p => typeof p.id === "string" && typeof p.name === "string")
      || !data.tasks.every(t => typeof t.id === "string" && typeof t.owner === "string"
        && typeof t.title === "string" && typeof t.done === "boolean" && Number.isFinite(t.created))) {
      throw new Error("Saved data is invalid. It has not been overwritten.");
    }
    return data;
  }
  write(data) { this.storage.setItem(this.key, JSON.stringify(data)); }
  createProfile(name) {
    name = name.trim().slice(0, 30);
    if (!name) throw new Error("Enter a profile name.");
    const data = this.read();
    if (data.profiles.some(p => p.name.toLowerCase() === name.toLowerCase()))
      throw new Error("That profile already exists. Choose it above.");
    const profile = {id: crypto.randomUUID(), name};
    data.profiles.push(profile); this.write(data); return profile.id;
  }
  list(owner) {
    return this.read().tasks.filter(t => t.owner === owner)
      .sort((a,b) => Number(a.done)-Number(b.done) || b.created-a.created);
  }
  add(owner, title) {
    const data = this.read(); title = title.trim().slice(0, 200);
    if (!data.profiles.some(p => p.id === owner)) throw new Error("Choose a profile first.");
    if (!title) throw new Error("Enter a task.");
    data.tasks.push({id: crypto.randomUUID(), owner, title, done: false, created: Date.now()});
    this.write(data);
  }
  change(owner, id, action) {
    const data = this.read();
    const task = data.tasks.find(t => t.id === id && t.owner === owner);
    if (!task) throw new Error("Task not found in this profile.");
    if (action === "toggle") task.done = !task.done;
    else if (action === "delete") data.tasks = data.tasks.filter(t => t !== task);
    else throw new Error("Unknown action.");
    this.write(data);
  }
  clear(owner) {
    const data = this.read();
    data.tasks = data.tasks.filter(t => t.owner !== owner || !t.done);
    this.write(data);
  }
}
