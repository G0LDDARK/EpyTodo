/*
** EPITECH PROJECT, 2025
** EpyTodo
** File description:
** frontend app.js
*/

let token = localStorage.getItem('token') || null;

const $auth = document.getElementById('auth');
const $dash = document.getElementById('dashboard');
const $regForm = document.getElementById('form-register');
const $logForm = document.getElementById('form-login');
const $createTodoForm = document.getElementById('form-create-todo');
const $todoList = document.getElementById('todo-list');
const $userName = document.getElementById('username');
const $btnLogout = document.getElementById('btn-logout');
const $modifyPopup = document.getElementById('modify-todo-popup');

function setToken(t) {
    token = t;
    if (t) localStorage.setItem('token', t);
    else localStorage.removeItem('token');
    $auth.classList.toggle('hidden', !!t);
    $dash.classList.toggle('hidden', !t);
    if (t) {
        loadUser();
        loadTodos();
    }
}

async function authFetch(url, opts = {}) {
    opts.headers = {
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
        'Authorization': `Bearer ${token}`
    };
    const res = await fetch(url, opts);
    if (res.status === 401 || res.status === 403) {
        setToken(null);
        throw new Error('Unauthorized');
    }
    return res.json();
}

$regForm.addEventListener('submit', async e => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData($regForm));

    if (!data.email || !data.password || !data.name || !data.firstname) {
        alert("All fields are required");
        return;
    }

    try {
        const res = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const { token: t, msg } = await res.json();
        if (res.ok && t) {
            setToken(t);
        } else {
            alert(msg || 'Registration failed');
        }
    } catch (err) {
        console.error('Error during registration:', err);
        alert("Something went wrong. Please try again later.");
    }
});

$logForm.addEventListener('submit', async e => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData($logForm));
    const res = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
    });
    const { token: t, msg } = await res.json();
    if (t) setToken(t);
    else alert(msg || 'Login failed');
});

$btnLogout.addEventListener('click', () => {
    setToken(null);
    $userName.textContent = "no_username"
    $todoList.innerHTML = "no_task";
});

async function loadUser() {
    try {
        const user = await authFetch('/user');
        $userName.textContent = `${user.firstname} `;
    } catch (err) {
        console.error('Failed to load user info:', err);
    }
}

async function deleteTodo(id) {
    try {
        const res = await fetch('/todos/' + id, {
            method: 'DELETE',
            headers: {
                'Content-Type':'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            },
        });
        loadTodos();
    } catch (err) {
        console.error('Failed to delete the todo:', err);
    }
}

$createTodoForm.addEventListener('submit', async e => {
    e.preventDefault();

    try {
        const data = Object.fromEntries(new FormData($createTodoForm));
        const res = await fetch('/todos', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            },
            body: JSON.stringify(data)
        });
        loadTodos();
    } catch (err) {
        alert("Couldn't create the todo", err);
    }
});

async function loadTodos() {
    try {
        const todos = await authFetch('/user/todos');
        if (todos.length == 0) {
            $todoList.innerHTML = "<p>No task for the moment</p>"
        } else {
            $todoList.innerHTML = todos.map(t =>
                `<li>
                    <p>Task: ${t.title}</p>
                    <p>Task detail: ${t.description}</p>
                    <p>Status: <span class="task-${t.status}">${t.status}</span></p>
                    <p>Due: ${new Date(t.due_time).toLocaleString()}</p>
                    <button class="btnModify" onclick="modifyPopupState(${t.id})">📝</button>
                    <button class="btnDelete" onclick="deleteTodo(${t.id})">🗑️</button>
                </li>`
            ).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

async function modifyTodo(todoId, userId) {
    try {
        const modifyForm = document.getElementById('form-modify-todo');
        const data = Object.fromEntries(new FormData(modifyForm));
        data.user_id = userId;
        const res = await fetch('/todos/' + todoId, {
            method: 'PUT',
            headers: {
                'Content-Type':'application/json',
                'Authorization': `Bearer ${localStorage.token}`
            },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            loadTodos();
            modifyPopupState(-1);
        } else {
            const err = await res.json();
            alert("Erreur : " + err.message);
        }
    } catch (err) {
        console.error("Can't modify todo", err)
    }
}

async function modifyPopupState(id) {
    if (id == -1) {
        $modifyPopup.classList.toggle('hidden');
        return;
    }
    try {
        const user = await authFetch('/user');
        const userId = user.id;
        const todos = await authFetch('/todos/' + id);
        $modifyPopup.classList.toggle('hidden');
        $modifyPopup.innerHTML =`
        <div id="modify-container">
            <p>Modify "${todos.title}"</p>
            <form id="form-modify-todo">
                <input name="title" type="text" value="${todos.title}" required>
                <input name="description" type="text" value="${todos.description}" required>
                <input name="due_time" type="datetime-local" value="${todos.due_time}" required>
                <select name="status"required>
                    <option value="">Task Status</option>
                    <option value="not started">Not started</option>
                    <option value="todo">Todo</option>
                    <option value="in progress">In progress</option>
                    <option value="done">Done</option>
                </select>
                <button type="button" class="submit-btn" id="modify-todo-btn" onclick="modifyTodo(${id}, ${userId})">Modify task</button>
            </form>
        <button class="submit-btn" id="close-popup" onclick="modifyPopupState(-1)">Cancel</button>
        </div>`
    } catch (err) {
        console.error("Error in task loading", err);
    }
}

if (token) setToken(token);
