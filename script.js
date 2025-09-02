document.addEventListener('DOMContentLoaded', async () => {
    const entryList = document.getElementById('blacklist-list');
    const form = document.getElementById('blacklist-form');
    const usernameInput = document.getElementById('added_by');
    const targetInput = document.getElementById('target');
    const reasonInput = document.getElementById('reason');
    const BASE_URL = 'https://ckrp.example.com/blacklist'; // Update to your backend URL
    const discordID = localStorage.getItem('userDiscordID') || '';

    // Auto-fill username field
    usernameInput.value = discordID;

    // Helper: create a blacklist list item
    function createBlacklistItem(entry) {
        const li = document.createElement('li');
        li.dataset.id = entry.id;
        li.textContent = `Target: ${entry.target} | Added by: ${entry.username} | Reason: ${entry.reason}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.addEventListener('click', async () => {
            try {
                const res = await fetch(`${BASE_URL}/${entry.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to delete entry');
                li.remove();
            } catch (err) {
                console.error('Delete error:', err);
                alert('Error deleting entry.');
            }
        });

        li.appendChild(deleteBtn);
        return li;
    }

    // Load blacklist entries
    async function loadBlacklist() {
        entryList.innerHTML = '';
        try {
            const res = await fetch(BASE_URL);
            if (!res.ok) throw new Error('Failed to fetch blacklist');
            const entries = await res.json();
            entries.forEach(entry => {
                entryList.appendChild(createBlacklistItem(entry));
            });
        } catch (err) {
            console.error('Load error:', err);
            entryList.textContent = 'Error loading blacklist.';
        }
    }

    await loadBlacklist();

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            username: usernameInput.value.trim(),
            target: targetInput.value.trim(),
            reason: reasonInput.value.trim()
        };

        console.log('Submitting:', data);

        if (!data.username || !data.target || !data.reason) {
            alert('Please fill all fields.');
            return;
        }

        try {
            const res = await fetch(BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            let responseData;
            try {
                responseData = await res.json();
            } catch {
                responseData = {};
            }

            if (!res.ok || responseData.error || !responseData.id) {
                console.error('Backend error:', responseData);
                alert('Failed to submit blacklist entry: ' + (responseData.error || 'Unknown error'));
                return;
            }

            entryList.appendChild(createBlacklistItem(responseData));
            form.reset();
            usernameInput.value = discordID;

        } catch (err) {
            console.error('Submit error:', err);
            alert('Error submitting entry.');
        }
    });
});
