const API_BASE = 'http://localhost:8000'; // Replace with hosted backend URL later

async function loadVehicles() {
  try {
    const res = await fetch(`${API_BASE}/vehicles`);
    const vehicles = await res.json();
    const list = document.getElementById('vehicle-list');
    list.innerHTML = '';
    vehicles.forEach(v => {
      list.innerHTML += `
        <div class="vehicle">
          <strong>${v.name}</strong><br>
          Miles: ${v.miles}<br>
          Condition: ${v.condition}<br>
          Added by: ${v.added_by}<br>
          ${v.image ? `<img src="${v.image}">` : ''}
        </div>
      `;
    });
  } catch (err) {
    document.getElementById('vehicle-list').innerHTML = '<p>Failed to load vehicles.</p>';
  }
}

document.getElementById('vehicle-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: document.getElementById('name').value,
    miles: parseInt(document.getElementById('miles').value),
    condition: document.getElementById('condition').value,
    image: document.getElementById('image').value,
    added_by: document.getElementById('added_by').value
  };
  try {
    await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    loadVehicles();
  } catch (err) {
    alert('Failed to add vehicle.');
  }
});

loadVehicles();