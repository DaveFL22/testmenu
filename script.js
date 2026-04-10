// The link for the LiveTaps tab
const tapsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=0&output=csv";

// The link for the ComingSoon tab (the GID number will be different for yours)
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
        if (!item.BeerName) return; // Skip empty rows

        const isKicked = item.Status && item.Status.toLowerCase() === "kicked";
        const statusClass = isKicked ? "kicked" : "";
        
        // Use the IconURL from your sheet, or a placeholder if empty
        const icon = item.IconURL ? item.IconURL : "https://via.placeholder.com/50?text=🍺";

        const html = `
            <div class="beer-item ${statusClass}">
                <img src="${icon}" class="beer-icon" alt="beer icon">
                <div class="beer-info">
                    <div class="beer-header">
                        ${isLive ? `<span class="tap-num">TAP ${item.Tap}</span>` : ""}
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