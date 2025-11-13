let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');

function init() {
    loadTasks();
    renderTasks();
    setupEventListeners();
}

function setupEventListeners() {
    addBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
}

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks = savedTasks;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

function startEdit(id) {
    editingTaskId = id;
    renderTasks();
}

function saveEdit(id, newText) {
    const task = tasks.find(t => t.id === id);
    if (task && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks();
    }
    editingTaskId = null;
    renderTasks();
}

function cancelEdit() {
    editingTaskId = null;
    renderTasks();
}

function clearCompleted() {
    if (confirm('Delete all completed tasks?')) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    }
}

function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

function updateStats() {
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('activeTasks').textContent =
        tasks.filter(t => !t.completed).length;
    document.getElementById('completedTasks').textContent =
        tasks.filter(t => t.completed).length;

    const hasCompleted = tasks.some(t => t.completed);
    clearCompletedBtn.disabled = !hasCompleted;
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();
    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <p>✨ No tasks to show</p>
                <p style="font-size: 14px; margin-top: 10px;">
                    ${currentFilter === 'all' ? 'Add your first task above!' :
                        currentFilter === 'active' ? 'All tasks completed! 🎉' :
                            'No completed tasks yet'}
                </p>
            </div>
        `;
    } else {
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;

            if (editingTaskId === task.id) {
                li.innerHTML = `
                    <input type="text" class="edit-input" value="${task.text}" id="edit-${task.id}">
                    <button class="save-btn" onclick="saveEdit(${task.id}, document.getElementById('edit-${task.id}').value)">Save</button>
                    <button class="cancel-btn" onclick="cancelEdit()">Cancel</button>
                `;
            } else {
                li.innerHTML = `
                    <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="toggleTask(${task.id})">
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        <button class="edit-btn" onclick="startEdit(${task.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                `;
            }

            taskList.appendChild(li);
        });
    }

    updateStats();
}

init();
