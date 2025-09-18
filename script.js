document.addEventListener("DOMContentLoaded", () => {
    // Use /api/blacklist (not just /blacklist)
    const BASE_URL = "https://ckrp-backend.onrender.com/api/blacklist";

    const entryList = document.getElementById("blacklistEntries");
    const form = document.getElementById("blacklistForm");

    // Load blacklist entries
    async function loadBlacklist() {
        entryList.innerHTML = "<p>Loading blacklist entries...</p>";

        try {
            const response = await fetch(BASE_URL);
            if (!response.ok) throw new Error("Failed to load blacklist");

            const data = await response.json();
            entryList.innerHTML = "";

            if (data.length === 0) {
                entryList.innerHTML = "<p>No players blacklisted yet.</p>";
            } else {
                data.forEach((entry) => {
                    const div = document.createElement("div");
                    div.className = "blacklist-entry";

                    div.innerHTML = `
                        <strong>${entry.username}</strong><br>
                        Danger Level: ${entry.danger_level}<br>
                        Reason: ${entry.reason}<br>
                        ${entry.image_url ? `<img src="${entry.image_url}" alt="${entry.username}" style="max-width:150px;">` : ""}
                    `;

                    entryList.appendChild(div);
                });
            }
        } catch (err) {
            console.error("Error loading blacklist:", err);
            entryList.innerHTML = "<p>⚠️ Failed to load blacklist.</p>";
        }
    }

    // Handle form submit
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // stop the "?" page reload

        const username = document.getElementById("username").value.trim();
        const dangerLevel = document.getElementById("dangerLevel").value.trim();
        const reason = document.getElementById("reason").value.trim();
        const imageUrl = document.getElementById("imageUrl").value.trim();

        if (!username || !dangerLevel || !reason) {
            alert("⚠️ Please fill out all required fields.");
            return;
        }

        try {
            const response = await fetch(BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    danger_level: dangerLevel,
                    reason,
                    image_url: imageUrl
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ Player blacklisted successfully!");
                form.reset();
                loadBlacklist();
            } else {
                console.error("API error:", result);
                alert("❌ Failed: " + (result.detail || result.error || JSON.stringify(result)));
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert("❌ Failed to submit blacklist entry: " + err.message);
        }
    });

    // Load entries on page start
    loadBlacklist();
});
