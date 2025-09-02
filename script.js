document.addEventListener('DOMContentLoaded', async () => {
    const entryList = document.getElementById('vehicle-list');
    const form = document.getElementById('vehicle-form');
    const addedByInput = document.getElementById('added_by');
    const discordID = localStorage.getItem('userDiscordID');
    const BASE_URL = 'http://127.0.0.1:8000';
    let isWhitelisted = false;

    const header = document.querySelector('h1');
    header.innerHTML += discordID ? ` (Logged in as ${discordID})` : '';

    const whitelistIDs = [
        "329997541523587073",
        "1094486136283467847",
        "898599688918405181"
    ];

    if (discordID && whitelistIDs.includes(discordID)) {
        isWhitelisted = true;
        addedByInput.value = discordID;
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
        const msg = document.createElement('p');
        msg.className = 'warning';
        msg.textContent = discordID
            ? 'You are not authorized to submit blacklist entries.'
            : 'Log in to submit blacklist entries.';
        form.parentElement.insertBefore(msg, form);
    }

    try {
        const res = await fetch(`${BASE_URL}/api/blacklist`);
        const data = await res.json();
        entryList.innerHTML = '';

        if (data.length === 0) {
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
                            location.reload();
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const entry = {
            name: document.getElementById('name').value.trim(),
            miles: document.getElementById('miles').value.trim(),
            condition: document.getElementById('condition').value.trim(),
            image: document.getElementById('image').value.trim(),
            added_by: discordID
        };

        console.log('Submitting blacklist entry:', entry);
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
                alert(`Error: ${result.detail || result.error || 'Failed to blacklist player.'}`);
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert('Failed to submit blacklist entry. Check console for details.');
        }
    });
});
