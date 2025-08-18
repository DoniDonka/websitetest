document.addEventListener('DOMContentLoaded', async () => {
  const vehicleList = document.getElementById('vehicle-list');
  const form = document.getElementById('vehicle-form');
  const addedByInput = document.getElementById('added_by');
  const discordID = localStorage.getItem('userDiscordID');

  // Show logged-in user
  const header = document.querySelector('h1');
  header.innerHTML += discordID
    ? ` <span style="font-size:0.6em;color:#888;">(Logged in as ${discordID})</span>`
    : '';

  // ✅ Always load vehicles
  try {
    const res = await fetch('https://ckrp-backend.onrender.com/vehicles');
    const data = await res.json();
    vehicleList.innerHTML = '';

    if (data.length === 0) {
      vehicleList.innerHTML = '<p>No vehicles listed yet.</p>';
    } else {
      data.forEach(vehicle => {
        const div = document.createElement('div');
        div.className = 'vehicle';
        div.innerHTML = `
          <h3>${vehicle.name}</h3>
          <p>Miles: ${vehicle.miles}</p>
          <p>Condition: ${vehicle.condition}</p>
          <p>Added by: ${vehicle.added_by}</p>
          ${vehicle.image ? `<img src="${vehicle.image}" alt="${vehicle.name}" style="max-width:200px;">` : ''}
        `;
        vehicleList.appendChild(div);
      });
    }
  } catch (err) {
    console.error('Error loading vehicles:', err);
    vehicleList.innerHTML = '<p style="color:red;">Failed to load vehicles.</p>';
  }

  // ✅ Check whitelist via backend
  if (discordID) {
    try {
      const res = await fetch(`https://ckrp-backend.onrender.com/is-whitelisted/${discordID}`);
      const result = await res.json();

      if (result.allowed === true) {
        addedByInput.value = discordID;
        form.style.display = 'block';
      } else {
        form.style.display = 'none';
        const msg = document.createElement('p');
        msg.style.color = 'red';
        msg.textContent = 'You are not authorized to add vehicles.';
        form.parentElement.insertBefore(msg, form);
      }
    } catch (err) {
      console.error('Whitelist check failed:', err);
      form.style.display = 'none';
    }
  } else {
    form.style.display = 'none';
    const msg = document.createElement('p');
    msg.style.color = 'red';
    msg.textContent = 'Log in to add vehicles.';
    form.parentElement.insertBefore(msg, form);
  }

  // ✅ Submit form
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
      const res = await fetch('https://ckrp-backend.onrender.com/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicle)
      });

      const result = await res.json();
      if (res.ok) {
        alert('Vehicle added successfully!');
        form.reset();
        location.reload();
      } else {
        alert(`Error: ${result.detail || 'Failed to add vehicle.'}`);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit vehicle. Check console for details.');
    }
  });
});