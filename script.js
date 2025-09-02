document.addEventListener('DOMContentLoaded', async () => {
    const entryList = document.getElementById('vehicle-list');
    const form = document.getElementById('vehicle-form');
    const addedByInput = document.getElementById('added_by');
    const discordID = localStorage.getItem('userDiscordID');
    const BASE_URL = 'https://ckrp-backend.onrender.com';
    let isWhitelisted = false;

    // Hide form initially
    form.style.display = 'none';

    const header = document.querySelector('h1');

    // Whitelisted Discord IDs
    const whitelistIDs = [
        "329997541523587073", // Doni
        "1094486136283467847", // Pin
        "898599688918405181"  // Musc
    ];

    // Check whitelist
    if (discordID && whitelistIDs.includes(discordID)) {
        isWhitelisted = true;
        addedByInput.value = discordID;
        form.style.display = 'block';
        header.innerHTML += ` (Logged in as ${discordID})`;
    } else {
        const msg = document.createElement('p');
        msg.className = 'warning';
        msg.textContent = discordID
            ? 'You are not authorized to submit blacklist entries.'
            : 'Log in to submit blacklist entries.';
        form.parentElement.insertBefore(msg, form);
    }

    // Load blacklist entries
    try {
        const res = await fetch(`${BASE_URL}/api/blacklist`);
        if (!res.ok) throw new Error('Failed to fetch blacklist');
        const data = await res.json();
        entryList.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            entryList.innerHTML = '<p>No players blacklisted yet.</p>';
        } else {
            data.forEach((entry, index) => {
                const div = document.createElement('div');
                div.className = 'blacklist-entry';
                if (parseInt(entry.miles) >= 8) div.classList.add('danger-high');

                div.innerHTML = `
                    <strong>${entry.name}</strong><br>
                    Danger Level: ${entry.miles}<br>
                    Reason: ${entry.condition}<br>
                    Submitted by: ${entry.added_by}<br>
                    ${entry.image ? `<img src="${entry.image}" alt="${entry.name}">` : ''}
                `;

                // Add delete button if whitelisted
                if (isWhitelisted) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.style.marginTop = '8px';
                    deleteBtn.onclick = async () => {
                        try {
                            const delRes = await fetch(`${BASE_URL}/blacklist/${index}?discord_id=${discordID}`, {
                                method: 'DELETE'
                            });
                            const delResult = await delRes.json();
                            if (delRes.ok) {
                                alert(delResult.message || 'Deleted');
                                location.reload();
                            } else {
                                alert(JSON.stringify(delResult, null, 2));
                            }
                        } catch (err) {
                            console.error('Delete error:', err);
                            alert('Failed to delete entry. Check console.');
                        }
                    };
                    div.appendChild(deleteBtn);
                }

                entryList.appendChild(div);
            });
        }
    } catch (err) {
        console.error('Error loading blacklist:', err);
        entryList.innerHTML = '<p>Failed to load blacklist. Backend might be unreachable.</p>';
    }

    // Submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const entry = {
            name: document.getElementById('name').value.trim(),
            miles: parseInt(document.getElementById('miles').value.trim()),
            condition: document.getElementById('condition').value.trim(),
            image: document.getElementById('image').value.trim(),
            added_by: discordID
        };

        try {
            const res = await fetch(`${BASE_URL}/api/blacklist`, {
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
                // Always stringify objects/arrays to avoid [object Object]
                alert('Error: ' + JSON.stringify(result, null, 2));
                console.error(result);
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert('Failed to submit blacklist entry. Check console for details.');
        }
    });
});
