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