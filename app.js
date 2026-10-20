// Global Application State Object
const state = {
  tasks: [],
  editingTaskId: null,
  pendingDeleteId: null
};

function initApp() {
  const savedTasks = localStorage.getItem('taskmaster_tasks');
  if (savedTasks) {
    state.tasks = JSON.parse(savedTasks);
  } else {
    state.tasks = [
      { id: '1', text: 'Go to the gym', completed: true, createdAt: Date.now() - 1200000 },
      { id: '2', text: 'Post 2 videos', completed: false, createdAt: Date.now() - 600000 },
      { id: '3', text: 'Call Mom', completed: false, createdAt: Date.now() }
    ];
    saveState();
  }

  bindEvents();
  render();
}

function saveState() {
  localStorage.setItem('taskmaster_tasks', JSON.stringify(state.tasks));
}

function bindEvents() {
  // Page Navigation Events
  document.getElementById('btn-show-add-group').addEventListener('click', showAddGroupView);
  document.getElementById('btn-submit-add-group').addEventListener('click', showTodayView);
  
  // Right Screen Inline Adding Events
  document.getElementById('btn-show-add-task').addEventListener('click', showInlineAddTaskRow);
  document.getElementById('inline-add-task-form').addEventListener('submit', handleInlineAddTask);
  
  // Task Interactions
  document.getElementById('task-list').addEventListener('click', handleTaskListClick);
  document.getElementById('task-list').addEventListener('dblclick', handleTaskListDblClick);
  document.getElementById('cancel-delete').addEventListener('click', closeDeleteDialog);
  document.getElementById('confirm-delete').addEventListener('click', handleConfirmDelete);
}

// Switches view focus
function showAddGroupView() {
  document.getElementById('view-add-group').scrollIntoView({ behavior: 'smooth' });
}

function showTodayView() {
  document.getElementById('view-today').scrollIntoView({ behavior: 'smooth' });
}

// Activates Inline Task Form on Screen 1
function showInlineAddTaskRow() {
  const formRow = document.getElementById('inline-add-task-form');
  const inputEl = document.getElementById('inline-task-input');
  
  formRow.classList.remove('hidden');
  inputEl.focus();
}

// Handles submitting inline task form
function handleInlineAddTask(e) {
  e.preventDefault();
  const input = document.getElementById('inline-task-input');
  const text = input.value.trim();

  if (text.length === 0 || text.length > 100) return;

  const newTask = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    createdAt: Date.now()
  };

  state.tasks.push(newTask);
  input.value = '';
  document.getElementById('inline-add-task-form').classList.add('hidden');
  
  saveState();
  render();
}

// Handles Checkboxes, Edit, and Delete clicks
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

function handleTaskListDblClick(e) {
  const itemEl = e.target.closest('[data-id]');
  if (!itemEl) return;
  enableTaskEditing(itemEl.dataset.id);
}

function toggleTaskCompletion(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveState();
    render();
  }
}

function enableTaskEditing(id) {
  state.editingTaskId = id;
  render();
}

function cancelTaskEditing() {
  state.editingTaskId = null;
  render();
}

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

// Modal handling
function openDeleteDialog(id) {
  state.pendingDeleteId = id;
  document.getElementById('delete-dialog').showModal();
}

function closeDeleteDialog() {
  state.pendingDeleteId = null;
  document.getElementById('delete-dialog').close();
}

function handleConfirmDelete() {
  if (state.pendingDeleteId) {
    state.tasks = state.tasks.filter(t => t.id !== state.pendingDeleteId);
    saveState();
    closeDeleteDialog();
    render();
  }
}

// Main Render Logic
function render() {
  const listEl = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-state');

  listEl.innerHTML = '';

  if (state.tasks.length === 0) {
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  state.tasks.forEach(task => {
    listEl.appendChild(createTaskElement(task));
  });
}

// Generates DOM Element for task items
function createTaskElement(task) {
  const li = document.createElement('li');
  li.dataset.id = task.id;
  li.className = 'flex items-center gap-3 w-full group py-0.5';

  if (state.editingTaskId === task.id) {
    li.appendChild(createEditingInput(task));
    return li;
  }

  const dateObj = new Date(task.createdAt);
  const timeString = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':00', '');

  const timeSpan = document.createElement('span');
  timeSpan.className = 'w-16 text-xs font-bold text-gray-900 shrink-0';
  timeSpan.textContent = timeString;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.className = 'task-checkbox peer appearance-none w-[20px] h-[20px] border-[2px] border-[#8B5CF6] rounded-full checked:bg-[#8B5CF6] cursor-pointer shrink-0 transition-colors focus:outline-none focus:ring-0';

  const textSpan = document.createElement('span');
  textSpan.textContent = task.text;
  textSpan.className = 'text-[14px] font-bold text-gray-900 truncate flex-1 cursor-pointer transition-all peer-checked:line-through peer-checked:decoration-[#8B5CF6] peer-checked:decoration-2';

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'edit-btn p-1 text-[#8B5CF6] hover:text-[#6D28D9] focus:outline-none text-xs';
  editBtn.innerHTML = '✏️';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn p-1 text-[#8B5CF6] hover:text-[#6D28D9] focus:outline-none text-xs';
  deleteBtn.innerHTML = '🗑️';

  actionsDiv.appendChild(editBtn);
  actionsDiv.appendChild(deleteBtn);

  li.appendChild(timeSpan);
  li.appendChild(checkbox);
  li.appendChild(textSpan);
  li.appendChild(actionsDiv);

  return li;
}

// Inline Editing Input Row
function createEditingInput(task) {
  const container = document.createElement('div');
  container.className = 'w-full py-1 flex';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = task.text;
  input.className = 'w-full px-0 py-1 text-[14px] font-bold border-b-2 border-[#8B5CF6] bg-transparent text-gray-900 focus:outline-none';

  let isCommitted = false;
  const commitEdit = () => {
    if (isCommitted) return;
    isCommitted = true;
    saveTaskEditing(task.id, input.value);
  };
  const cancelEdit = () => {
    if (isCommitted) return;
    isCommitted = true;
    cancelTaskEditing();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
    else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
  });
  input.addEventListener('blur', commitEdit);

  setTimeout(() => { input.focus(); input.select(); }, 0);
  
  container.appendChild(input);
  return container;
}

document.addEventListener('DOMContentLoaded', initApp);