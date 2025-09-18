document.addEventListener('DOMContentLoaded', async () => {
    const entryList = document.getElementById('blacklist-entries');
    const form = document.getElementById('blacklist-form');
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
    async function loadEntries() {
        entryList.innerHTML = '<p>Loading blacklist entries...</p>';
        try {
            const res = await fetch(`${BASE_URL}/api/blacklist`);
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
            const data = await res.json();
            entryList.innerHTML = '';

            if (data.length === 0) {
                entryList.innerHTML = '<p>No players blacklisted yet.</p>';
            } else {
                data.forEach((entry, index) => {
                    const div = document.createElement('div');
                    div.className = 'blacklist-entry';
                    if (parseInt(entry.danger_level) >= 8) div.classList.add('danger-high');

                    div.innerHTML = `
                        <strong>${entry.username}</strong><br>
                        Danger Level: ${entry.danger_level}<br>
                        Reason: ${entry.reason}<br>
                        Submitted by: ${entry.added_by}<br>
                        ${entry.image_url ? `<img src="${entry.image_url}" alt="${entry.username}">` : ''}
                    `;

                    if (isWhitelisted) {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.style.marginTop = '8px';
                        deleteBtn.onclick = async () => {
                            try {
                                const res = await fetch(`${BASE_URL}/blacklist/${index}?discord_id=${discordID}`, {
                                    method: 'DELETE'
                                });
                                const result = await res.json();
                                alert(result.message || 'Deleted');
                                loadEntries();
                            } catch (err) {
                                console.error('Delete error:', err);
                                alert('Failed to delete entry.');
                            }
                        };
                        div.appendChild(deleteBtn);
                    }

                    entryList.appendChild(div);
                });
            }
        } catch (err) {
            console.error('Error loading blacklist:', err);
            entryList.innerHTML = '<p>Failed to load blacklist.</p>';
        }
    }

    await loadEntries();

    // Submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const entry = {
            username: document.getElementById('username').value.trim(),
            danger_level: document.getElementById('danger_level').value.trim(),
            reason: document.getElementById('reason').value.trim(),
            image_url: document.getElementById('image_url').value.trim(),
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
                loadEntries();
            } else {
                console.error('Error response:', result);
                alert(result.detail || result.error || JSON.stringify(result));
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert('Failed to submit blacklist entry. Check console for details.');
        }
    });
});
