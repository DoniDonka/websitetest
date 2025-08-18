// ✅ Backend API base
const API_BASE = 'https://ckrp-backend.onrender.com';

// ✅ Check whitelist status
async function checkWhitelist(discordID) {
  try {
    const res = await fetch(`${API_BASE}/is-whitelisted/${discordID}`);
    const data = await res.json();
    return data.allowed;
  } catch (err) {
    console.error('Whitelist check failed:', err);
    return false;
  }
}

// ✅ Load vehicles
async function loadVehicles() {
  try {
    const res = await fetch(`${API_BASE}/vehicles`);
    const vehicles = await res.json();
    const list = document.getElementById('vehicle-list');
    list.innerHTML = '';

    if (vehicles.length === 0) {
      list.innerHTML = '<p>No vehicles yet.</p>';
      return;
    }

    const discordID = localStorage.getItem('userDiscordID');
    const isAllowed = await checkWhitelist(discordID);

    vehicles.forEach((v, i) => {
      const vehicleHTML = `
        <div class="vehicle-card">
          <h3>${v.name}</h3>
          <p>Miles: ${v.miles}</p>
          <p>Condition: ${v.condition}</p>
          <p>Added by: ${v.added_by}</p>
          ${v.image ? `<img src="${v.image}" alt="Vehicle Image">` : ''}
          ${isAllowed ? `<button onclick="deleteVehicle(${i})">Delete</button>` : ''}
        </div>
      `;
      list.innerHTML += vehicleHTML;
    });
  } catch (err) {
    console.error('Failed to load vehicles:', err);
    document.getElementById('vehicle-list').innerHTML = '<p>Error loading vehicles.</p>';
  }
}

// ✅ Submit form
document.getElementById('vehicle-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const discordID = localStorage.getItem('userDiscordID');
  const isAllowed = await checkWhitelist(discordID);

  if (!isAllowed) {
    alert("You are not authorized to add vehicles.");
    return;
  }

  const vehicle = {
    name: document.getElementById('name').value,
    miles: parseInt(document.getElementById('miles').value),
    condition: document.getElementById('condition').value,
    image: document.getElementById('image').value,
    added_by: discordID
  };

  try {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle)
    });

    if (!res.ok) throw new Error('Failed to add vehicle');

    await loadVehicles();
    e.target.reset();
  } catch (err) {
    console.error('Error adding vehicle:', err);
    alert('Failed to add vehicle. Please try again.');
  }
});

// ✅ Delete vehicle
async function deleteVehicle(index) {
  const discordID = localStorage.getItem('userDiscordID');
  try {
    const res = await fetch(`${API_BASE}/vehicles/${index}?discord_id=${discordID}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Delete failed');
    await loadVehicles();
  } catch (err) {
    console.error('Error deleting vehicle:', err);
    alert('Failed to delete vehicle.');
  }
}

// ✅ Theme toggle
function applyTheme(theme) {
  document.body.classList.remove('dark-mode', 'light-mode');
  document.body.classList.add(`${theme}-mode`);
  localStorage.setItem('theme', theme);
  document.querySelector('#theme-toggle button').textContent = theme === 'dark' ? '🌞 Light' : '🌙 Dark';
}

function toggleTheme() {
  const current = localStorage.getItem('theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

// ✅ Init
(async () => {
  let discordID = localStorage.getItem('userDiscordID');
  if (!discordID) {
    discordID = prompt("Enter your Discord ID:");
    localStorage.setItem('userDiscordID', discordID);
  }

  const isAllowed = await checkWhitelist(discordID);
  if (!isAllowed) {
    document.getElementById('vehicle-form').style.display = 'none';
  }

  applyTheme(localStorage.getItem('theme') || 'dark');
  await loadVehicles();
})();