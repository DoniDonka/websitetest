// Theme toggle
document.getElementById('toggle-theme').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Fake user database
const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'guest', password: 'guest123', role: 'guest' }
];

// Login form handler
function authenticateUser(username, password) {
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem('userRole', user.role);
    loadDashboard(user.role);
  } else {
    alert('Invalid credentials');
  }
}

// Load dashboard based on role
function loadDashboard(role) {
  const contentArea = document.getElementById('content-area');
  if (role === 'admin') {
    contentArea.innerHTML = `
      <div class="card">Welcome Admin</div>
      <div class="card">Manage Users</div>
      <div class="card">Game Settings</div>
    `;
  } else {
    contentArea.innerHTML = `
      <div class="card">Welcome Guest</div>
      <div class="card">View Stats</div>
      <div class="card">Join Game</div>
    `;
  }
}

// Sidebar navigation
const links = document.querySelectorAll('.sidebar ul li a');
links.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.textContent.trim();
    const role = localStorage.getItem('userRole') || 'guest';

    const contentArea = document.getElementById('content-area');
    switch (page) {
      case 'Overview':
        loadDashboard(role);
        break;
      case 'Users':
        contentArea.innerHTML = role === 'admin'
          ? `<div class="card">User Management Panel</div>`
          : `<div class="card">Access Denied</div>`;
        break;
      case 'Settings':
        contentArea.innerHTML = `
          <div class="card">Settings</div>
          <label><input type="checkbox" onchange="document.body.classList.toggle('dark-mode')"> Night Mode</label>
        `;
        break;
      default:
        contentArea.innerHTML = `<div class="card">Welcome to the dashboard!</div>`;
    }
  });
});

// Auto-load role if already logged in
window.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem('userRole');
  if (role) loadDashboard(role);
});