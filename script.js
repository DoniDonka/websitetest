// ✅ Backend API base (Render)
const API_BASE = 'https://ckrp-backend.onrender.com';

// ✅ Check whitelist status from backend
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

// ✅ Load vehicles from backend
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
      list.innerHTML += `
        <div class="vehicle">
          <strong>${v.name}</strong><br>
          Miles: ${v.miles}<br>
          Condition: ${v.condition}<br>
          Added by: ${v.added_by}<br>
          ${v.image ? `<img src="${v.image}" alt="Vehicle Image">` : ''}
          ${isAllowed ? `<button onclick="deleteVehicle(${i})">Delete</button>` : ''}
        </div>
      `;
    });
  } catch (err) {
    console.error('Failed to load vehicles:', err);
    document.getElementById('vehicle-list').innerHTML = '<p>Error loading vehicles.</p>';
  }
}

// ✅ Handle form submission
document.getElementById('vehicle-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const discordID = document.getElementById('added_by').value.trim();
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

    if (!res.ok) {
      throw new Error('Failed to add vehicle');
    }

    await loadVehicles();
    e.target.reset();
  } catch (err) {
    console.error('Error adding vehicle:', err);
    alert('Failed to add vehicle. Please try again.');
  }
});

// ✅ Delete vehicle by index
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

// ✅ Prompt for Discord ID and hide form if not whitelisted
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

  await loadVehicles();
})();