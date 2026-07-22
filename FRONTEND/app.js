const API = "http://localhost:5000/api";

// -------------------- AUTH --------------------

function register() {
  fetch(API + "/auth/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  })
  .then(res => res.json())
  .then(() => {
    alert("Registered successfully");
    window.location.href = "login.html";
  });
}

function login() {
  fetch(API + "/auth/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }
  });
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// -------------------- TASKS (USER) --------------------

function addTask() {
  fetch(API + "/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({
      title: document.getElementById("title").value,
      description: document.getElementById("desc").value
    })
  })
  .then(() => loadTasks());
}

function loadTasks() {
  fetch(API + "/tasks", {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("tasks").innerHTML =
      data.map(task => `
        <div class="task">
          <h4>${task.title}</h4>
          <p>${task.description}</p>
          <p>Status: ${task.status}</p>
        </div>
      `).join("");
  });
}

// -------------------- ADMIN --------------------

function loadAllTasks() {
  fetch(API + "/tasks/admin/all", {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("allTasks").innerHTML =
      data.map(task => `
        <div class="task">
          <h4>${task.title}</h4>
          <p>${task.description}</p>
          <p>Status: ${task.status}</p>
        </div>
      `).join("");
  });
}
function userLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  })
  .then(res => res.json())
  .then(data => {

    // ❌ Handle backend errors
    if (!data.token) {
      alert(data || "Login failed");
      return;
    }

    // 🚫 Block admin from user login page
    if (data.role === "admin") {
      alert("Admin must use Admin Login page");
      return;
    }

    // ✅ Save session
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    alert("Login successful");

    // ✅ Redirect user dashboard
    window.location.href = "dashboard.html";
  })
  .catch(err => {
    console.log(err);
    alert("Server error");
  });
}
function loadDashboard() {
  loadStats();
  loadUsers();
  loadAllTasks();
}
function loadStats() {
  fetch("http://localhost:5000/api/admin/stats", {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("stats").innerHTML = `
      <p><b>Total Users:</b> ${data.users}</p>
      <p><b>Total Tasks:</b> ${data.tasks}</p>
    `;
  });
}
function loadUsers() {
  fetch("http://localhost:5000/api/admin/users", {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("users").innerHTML =
      data.map(user => `
        <div class="task">
          <p><b>${user.name}</b> (${user.email})</p>
          <button onclick="deleteUser(${user.id})">Delete User</button>
        </div>
      `).join("");
  });
}
function deleteUser(id) {
  fetch(`http://localhost:5000/api/admin/users/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  })
  .then(() => loadUsers());
}
function loadAllTasks() {
  fetch("http://localhost:5000/api/admin/tasks", {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("tasks").innerHTML =
      data.map(task => `
        <div class="task">
          <p><b>${task.title}</b></p>
          <p>${task.description}</p>
          <p>Status: ${task.status}</p>
          <button onclick="deleteTask(${task.id})">Delete Task</button>
        </div>
      `).join("");
  });
}
function deleteTask(id) {
  fetch(`http://localhost:5000/api/admin/tasks/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  })
  .then(() => loadAllTasks());
}