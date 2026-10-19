const state = {
  tasks: [],
  filter: 'all',
  darkMode: false,
  editingTaskId: null,
  pendingDeleteId: null
};
// localStorage on load
function initApp() {
  const savedTasks = localStorage.getItem('taskmaster_tasks');
  const savedFilter = localStorage.getItem('taskmaster_filter');
  const savedDark = localStorage.getItem('taskmaster_dark');

  if (savedTasks) state.tasks = JSON.parse(savedTasks);
  if (savedFilter) state.filter = savedFilter;
  if (savedDark !== null) state.darkMode = JSON.parse(savedDark);

  applyTheme();
  bindEvents();
  render();
}
function saveState() {
  localStorage.setItem('taskmaster_tasks', JSON.stringify(state.tasks));
  localStorage.setItem('taskmaster_filter', state.filter);
  localStorage.setItem('taskmaster_dark', JSON.stringify(state.darkMode));
}

// Applies or removes dark mode CSS class from root element
function applyTheme() {
  const html = document.documentElement;
  const icon = document.getElementById('theme-icon');
  if (state.darkMode) {
    html.classList.add('dark');
    icon.textContent = '☀️';
  } else {
    html.classList.remove('dark');
    icon.textContent = '🌙';
  }
}
// Formats timestamp into readable time and date string
function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${timeStr}, ${dateStr}`;
}
function bindEvents() {
  document.getElementById('task-form').addEventListener('submit', handleAddTask);
  document.getElementById('task-input').addEventListener('input', clearError);
  document.getElementById('theme-toggle').addEventListener('click', handleToggleTheme);
  document.getElementById('clear-completed').addEventListener('click', handleClearCompleted);
  document.getElementById('task-list').addEventListener('click', handleTaskListClick);
  document.getElementById('task-list').addEventListener('dblclick', handleTaskListDblClick);
  document.getElementById('cancel-delete').addEventListener('click', closeDeleteDialog);
  document.getElementById('confirm-delete').addEventListener('click', handleConfirmDelete);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', handleFilterChange);
  });
}
function handleFilterChange(e) {
  state.filter = e.target.dataset.filter;
  saveState();
  render();
}

// Delegated click handler for big task cards using closest selector
function handleTaskListClick(e) {
  const itemEl = e.target.closest('[data-id]');
  if (!itemEl) return;
  const taskId = itemEl.dataset.id;

  if (e.target.closest('.task-checkbox')) {
    toggleTaskCompletion(taskId);
  } else if (e.target.closest('.delete-btn')) {
    openDeleteDialog(taskId);
  } else if (e.target.closest('.edit-btn')) {
    enableTaskEditing(taskId);
  }
}

// Handles double click event on task cards to initiate inline editing
function handleTaskListDblClick(e) {
  const itemEl = e.target.closest('[data-id]');
  if (!itemEl) return;
  enableTaskEditing(itemEl.dataset.id);
}

// Toggles task completion boolean flag by ID
function toggleTaskCompletion(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveState();
    render();
  }
}

// Enables inline editing mode for specified task ID
function enableTaskEditing(id) {
  state.editingTaskId = id;
  render();
}

// Cancels inline task editing mode without saving
function cancelTaskEditing() {
  state.editingTaskId = null;
  render();
}

// Saves edited task text with validation constraints
function saveTaskEditing(id, newText) {
  const trimmed = newText.trim();
  if (trimmed.length === 0 || trimmed.length > 100) {
    cancelTaskEditing();
    return;
  }
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.text = trimmed;
    saveState();
  }
  state.editingTaskId = null;
  render();
}

// Opens modal confirmation dialog for task deletion
function openDeleteDialog(id) {
  state.pendingDeleteId = id;
  const dialog = document.getElementById('delete-dialog');
  dialog.showModal();
}

// Closes task deletion confirmation modal dialog
function closeDeleteDialog() {
  state.pendingDeleteId = null;
  const dialog = document.getElementById('delete-dialog');
  dialog.close();
}

// Confirms and executes deletion of pending task item
function handleConfirmDelete() {
  if (state.pendingDeleteId) {
    state.tasks = state.tasks.filter(t => t.id !== state.pendingDeleteId);
    saveState();
    closeDeleteDialog();
    render();
  }
}

// Clears all completed tasks from application state
function handleClearCompleted() {
  state.tasks = state.tasks.filter(t => !t.completed);
  saveState();
  render();
}

// Returns filtered tasks array based on active filter setting
function getVisibleTasks() {
  if (state.filter === 'active') return state.tasks.filter(t => !t.completed);
  if (state.filter === 'completed') return state.tasks.filter(t => t.completed);
  return state.tasks;
}
function render() {
  renderFilters();
  renderList();
  renderCounters();
  renderProgressBar();
}

// Updates visual state of active filter buttons
function renderFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const isSelected = btn.dataset.filter === state.filter;
    btn.className = `filter-btn px-4 py-2 text-sm font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      isSelected
        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
    }`;
  });
}

// Renders task list elements as big cards or shows empty state
function renderList() {
  const listEl = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-state');
  const visibleTasks = getVisibleTasks();

  listEl.innerHTML = '';

  if (visibleTasks.length === 0) {
    emptyEl.classList.remove('hidden');
    updateEmptyStateMessage();
    return;
  }

  emptyEl.classList.add('hidden');
  visibleTasks.forEach(task => {
    const li = createBigCardElement(task);
    listEl.appendChild(li);
  });
}

// Updates empty state message according to current filter
function updateEmptyStateMessage() {
  const textEl = document.getElementById('empty-state-text');
  if (state.filter === 'active') textEl.textContent = 'No active tasks right now!';
  else if (state.filter === 'completed') textEl.textContent = 'No completed tasks yet.';
  else textEl.textContent = 'Your task list is empty. Add a task above!';
}

// Safely constructs DOM element for big task card with priority border and timestamp
function createBigCardElement(task) {
  const li = document.createElement('li');
  li.dataset.id = task.id;
  let priorityCardStyles = 'border-l-8 border-l-emerald-500 border-slate-200 dark:border-slate-700 bg-emerald-50/20 dark:bg-emerald-950/10';
  if (task.priority === 'high') {
    priorityCardStyles = 'border-l-8 border-l-red-500 border-slate-200 dark:border-slate-700 bg-red-50/20 dark:bg-red-950/10';
  } else if (task.priority === 'medium') {
    priorityCardStyles = 'border-l-8 border-l-amber-500 border-slate-200 dark:border-slate-700 bg-amber-50/20 dark:bg-amber-950/10';
  }

  li.className = `p-6 rounded-2xl border-2 shadow-md flex flex-col justify-between transition-all hover:shadow-xl ${priorityCardStyles} ${
    task.completed ? 'opacity-70 bg-slate-100/50 dark:bg-slate-800/40' : 'bg-white dark:bg-slate-800'
  }`;

  if (state.editingTaskId === task.id) {
    li.appendChild(createEditingInput(task));
    return li;
  }