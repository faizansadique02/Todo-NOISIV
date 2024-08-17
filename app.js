document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const addTaskBtn = document.getElementById('add-task-btn');
    const addUserBtn = document.getElementById('add-user-btn');
    const userDialog = document.getElementById('user-dialog');
    const saveUserBtn = document.getElementById('save-user-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const newUserInput = document.getElementById('new-user');

    let users = [];

    // Load users from JSON file
    fetch('users.json')
        .then(response => response.json())
        .then(data => {
            users = data;
        });

    // Add Task
    addTaskBtn.addEventListener('click', () => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';

        const taskNameInput = document.createElement('input');
        taskNameInput.type = 'text';
        taskNameInput.value = `Task ${taskList.children.length + 1}`;

        const userDropdown = document.createElement('select');
        updateDropdown(userDropdown);

        taskItem.appendChild(taskNameInput);
        taskItem.appendChild(userDropdown);
        taskList.appendChild(taskItem);
    });

    // Add User
    addUserBtn.addEventListener('click', () => {
        userDialog.style.display = 'flex';
    });

    saveUserBtn.addEventListener('click', () => {
        const newUser = newUserInput.value.trim();
        if (newUser) {
            users.push(newUser);
            saveUsers();
            closeDialog();
        }
    });

    cancelBtn.addEventListener('click', closeDialog);

    function closeDialog() {
        userDialog.style.display = 'none';
        newUserInput.value = '';
    }

    function updateDropdown(dropdown) {
        dropdown.innerHTML = '';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            dropdown.appendChild(option);
        });
    }

    function saveUsers() {
        fetch('users.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(users)
        })
        .then(() => {
            document.querySelectorAll('select').forEach(updateDropdown);
        });
    }
});
