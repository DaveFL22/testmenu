// URL for LiveTaps Tab
const tapsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=0&output=csv";

// URL for ComingSoon Tab (Updated with your GID)
const soonURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=1834687396&output=csv";

document.addEventListener("DOMContentLoaded", () => {
    // Fetch Live Taps
    Papa.parse(tapsURL, {
        download: true,
        header: true,
        complete: (results) => renderMenu(results.data, "live-taps-container", true)
    });

    // Fetch Coming Soon
    Papa.parse(soonURL, {
        download: true,
        header: true,
        complete: (results) => renderMenu(results.data, "coming-soon-container", false)
    });
});

function renderMenu(data, containerId, isLive) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; 

    data.forEach(item => {
        // Use BeerName as the unique key to prevent empty rows
        if (!item.BeerName || item.BeerName.trim() === "") return;

        const isKicked = item.Status && item.Status.toLowerCase().includes("kicked");
        const statusClass = isKicked ? "kicked" : "";
        
        // Handle Icons
        const icon = item.IconURL ? item.IconURL : "https://via.placeholder.com/100x140?text=🍺";

        const html = `
            <div class="beer-item ${statusClass}">
                <img src="${icon}" class="beer-icon" alt="beer logo">
                <div class="beer-info">
                    <div class="beer-header">
                        ${isLive && item.Tap ? `<span class="tap-num">TAP ${item.Tap}</span>` : ""}
                        <h2>${item.BeerName}</h2>
                    </div>
                    <p class="beer-details">${item.Style} • ${item.ABV}%</p>
                    <p class="beer-notes">${item.Notes}</p>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}