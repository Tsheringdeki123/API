// The page is served by your Express server, so the API is on the same address.
const API = '/tasks';

let tasks = [];
let filter = 'all';

const listEl = document.getElementById('list');
const countEl = document.getElementById('count');
const errorEl = document.getElementById('error');
const form = document.getElementById('addForm');
const input = document.getElementById('titleInput');

/* ---------- Messages ---------- */
function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

function clearError() {
  errorEl.classList.remove('show');
}

/* ---------- Talk to the API ---------- */
async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    throw new Error(
      'Cannot reach the server. Start it with "npm run dev", then open http://localhost:3000 in your browser.'
    );
  }

  if (!res.ok) {
    let detail = 'Request failed (' + res.status + ').';
    try {
      const data = await res.json();
      if (data.error) detail = data.error;
    } catch (e) {}
    throw new Error(detail);
  }

  // DELETE returns 204 with an empty body
  return res.status === 204 ? null : res.json();
}

async function loadTasks() {
  try {
    tasks = await request(API);
    clearError();
  } catch (e) {
    showError(e.message);
    tasks = [];
  }
  render();
}

async function addTask(title) {
  try {
    await request(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    await loadTasks();
  } catch (e) {
    showError(e.message);
  }
}

async function toggle(task) {
  try {
    await request(API + '/' + task.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    });
    await loadTasks();
  } catch (e) {
    showError(e.message);
    await loadTasks();
  }
}

async function remove(task) {
  if (!confirm('Delete "' + task.title + '"?')) return;
  try {
    await request(API + '/' + task.id, { method: 'DELETE' });
    await loadTasks();
  } catch (e) {
    showError(e.message);
  }
}

/* ---------- Draw the list ---------- */
function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d)) return '';
  return 'Added ' + d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function render() {
  const open = tasks.filter(t => !t.completed).length;
  countEl.textContent = tasks.length
    ? open + ' of ' + tasks.length + ' still to do'
    : '';

  const visible = tasks.filter(t =>
    filter === 'all' ? true : filter === 'done' ? !!t.completed : !t.completed
  );

  listEl.innerHTML = '';

  if (visible.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = tasks.length === 0
      ? 'No tasks yet. Type one above and press Add task.'
      : 'No tasks in this view.';
    listEl.appendChild(li);
    return;
  }

  visible.forEach(task => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('done');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = !!task.completed;
    box.setAttribute('aria-label', 'Mark "' + task.title + '" as done');
    box.addEventListener('change', () => toggle(task));

    const text = document.createElement('div');
    text.className = 'text';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = task.title;

    const when = document.createElement('div');
    when.className = 'when';
    when.textContent = formatDate(task.created_at);

    text.append(title, when);

    const del = document.createElement('button');
    del.className = 'del';
    del.type = 'button';
    del.textContent = 'Delete';
    del.setAttribute('aria-label', 'Delete "' + task.title + '"');
    del.addEventListener('click', () => remove(task));

    li.append(box, text, del);
    listEl.appendChild(li);
  });
}

/* ---------- Events ---------- */
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) {
    showError('Type a task title first.');
    input.focus();
    return;
  }
  input.value = '';
  await addTask(title);
  input.focus();
});

document.querySelectorAll('.filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.filters button').forEach(b =>
      b.setAttribute('aria-pressed', String(b === btn))
    );
    render();
  });
});

/* ---------- Start ---------- */
loadTasks();
