document.addEventListener('DOMContentLoaded', async () => {
    const entryList = document.getElementById('vehicle-list'); // reuse container
    const form = document.getElementById('vehicle-form');
    const addedByInput = document.getElementById('added_by');
    const discordID = localStorage.getItem('userDiscordID');

    // Show logged-in user
    const header = document.querySelector('h1');
    header.innerHTML += discordID ? ` (Logged in as ${discordID})` : '';

    // Always load blacklist entries
    try {
        const res = await fetch('https://ckrp-backend.onrender.com/blacklist');
        const data = await res.json();
        entryList.innerHTML = '';

        if (data.length === 0) {
            entryList.innerHTML = '<p>No players blacklisted yet.</p>';
        } else {
            data.forEach(entry => {
                const div = document.createElement('div');
                div.className = 'vehicle'; // reuse styling
                div.innerHTML = `
                    <strong>${entry.name}</strong><br>
                    Danger Level: ${entry.miles}<br>
                    Reason: ${entry.condition}<br>
                    Submitted by: ${entry.added_by}<br>
                    ${entry.image ? `<img src="${entry.image}" alt="${entry.name}">` : ''}
                `;
                entryList.appendChild(div);
            });
        }
    } catch (err) {
        console.error('Error loading blacklist:', err);
        entryList.innerHTML = '<p>Failed to load blacklist.</p>';
    }

    // Check whitelist via backend
    if (discordID) {
        try {
            const res = await fetch(`https://ckrp-backend.onrender.com/is-whitelisted/${discordID}`);
            const result = await res.json();

            if (result.allowed) {
                addedByInput.value = discordID;
                form.style.display = 'block';
            } else {
                form.style.display = 'none';
                const msg = document.createElement('p');
                msg.style.color = 'red';
                msg.textContent = 'You are not authorized to submit blacklist entries.';
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
        msg.textContent = 'Log in to submit blacklist entries.';
        form.parentElement.insertBefore(msg, form);
    }

    // Submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const entry = {
            name: document.getElementById('name').value.trim(),
            miles: parseInt(document.getElementById('miles').value),
            condition: document.getElementById('condition').value.trim(),
            image: document.getElementById('image').value.trim(),
            added_by: discordID
        };

        console.log('Submitting blacklist entry:', entry);
        try {
            const res = await fetch('https://ckrp-backend.onrender.com/blacklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });
            const result = await res.json();

            if (res.ok) {
                alert('Player blacklisted successfully!');
                form.reset();
                location.reload();
            } else {
                alert(`Error: ${result.detail || 'Failed to blacklist player.'}`);
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert('Failed to submit blacklist entry. Check console for details.');
        }
    });
});

