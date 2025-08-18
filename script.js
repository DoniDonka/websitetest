// ✅ Whitelisted Discord IDs
const allowedIDs = [
  "329997541523587073",
  "1287198545539104780"
];

// ✅ Backend API base
const API_BASE = 'https://ckrp-backend.onrender.com';

// ✅ Get Discord ID from localStorage
const discordID = localStorage.getItem('userDiscordID');

// ✅ DOM elements
const vehicleList = document.getElementById('vehicle-list');
const form = document.getElementById('vehicle-form');
const addedByInput = document.getElementById('added_by');

// ✅ Show logged-in user
const header = document.querySelector('h1');
header.innerHTML += discordID ? ` <span style="font-size:0.6em;color:#888;">(Logged in as ${discordID})</span>` : '';

// ✅ Hide form if not whitelisted
if (!discordID || !allowedIDs.includes(discordID)) {
  form.style.display = 'none';
  vehicleList.innerHTML = `<p style="color:red;">You are not authorized to add vehicles.</p>`;
} else {
  addedByInput.value = discordID;
}

// ✅ Load vehicles from backend
async function loadVehicles() {
  try {
    const res = await fetch(`${API_BASE}/vehicles`);
    const vehicles = await res.json();
    vehicleList.innerHTML = '';

    if (vehicles.length === 0) {
      vehicleList.innerHTML = '<p>No vehicles yet.</p>';
      return;
    }

    vehicles.forEach(v => {
      const div = document.createElement('div');
      div.className = 'vehicle';
      div.innerHTML = `
        <strong>${v.name}</strong><br>
        Miles: ${v.miles}<br>
        Condition: ${v.condition}<br>
        Added by: ${v.added_by}<br>
        ${v.image ? `<img src="${v.image}" alt="Vehicle Image" style="max-width:200px;margin-top:5px;">` : ''}
      `;
      vehicleList.appendChild(div);
    });
  } catch (err) {
    console.error('Failed to load vehicles:', err);
    vehicleList.innerHTML = '<p>Error loading vehicles.</p>';
  }
}

// ✅ Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const vehicle = {
    name: document.getElementById('name').value.trim(),
    miles: parseInt(document.getElementById('miles').value),
    condition: document.getElementById('condition').value.trim(),
    image: document.getElementById('image').value.trim(),
    added_by: discordID
  };

  console.log('Submitting vehicle:', vehicle);

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
    form.reset();
  } catch (err) {
    console.error('Error adding vehicle:', err);
    alert('Failed to add vehicle. Please try again.');
  }
});

// ✅ Initial load
loadVehicles();