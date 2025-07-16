// Theme toggle button
document.getElementById('toggle-theme').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Sidebar navigation logic
const contentArea = document.getElementById('content-area');
const links = document.querySelectorAll('.sidebar ul li a');

links.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.textContent.trim();

    switch (page) {
      case 'Overview':
        contentArea.innerHTML = `
          <div class="card">Users: 120</div>
          <div class="card">Orders: 35</div>
          <div class="card">Revenue: $4.2K</div>
        `;
        break;

      case 'Users':
        contentArea.innerHTML = `
          <div class="card">User List</div>
          <ul style="padding-left: 20px; text-align: left;">
            <li>PlayerOne</li>
            <li>CommanderX</li>
            <li>ModMaster22</li>
          </ul>
        `;
        break;

      case 'Settings':
        contentArea.innerHTML = `
          <div class="card">Settings Panel</div>
          <label style="display: block; margin-top: 10px;">
            <input type="checkbox" onchange="document.body.classList.toggle('dark-mode')"> Night Mode
          </label>
        `;
        break;

      default:
        contentArea.innerHTML = `<div class="card">Welcome to the dashboard!</div>`;
    }
  });
});