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