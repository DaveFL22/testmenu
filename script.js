// --- CONFIGURATION ---
const tapsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=0&output=csv";
const soonURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=1834687396&output=csv";

// --- STARFIELD ENGINE ---
(function() {
    const canvas = document.getElementById("starfield");
    const ctx = canvas.getContext("2d");
    let width, height, stars = [];
    const layers = [
        { count: 180, speed: 0.02, size: 1.0, alpha: 0.4 },
        { count: 120, speed: 0.05, size: 1.3, alpha: 0.6 },
        { count: 60, speed: 0.08, size: 1.6, alpha: 0.9 }
    ];
    let meteors = [];

    function spawnMeteor() {
        const startX = Math.random() * width;
        meteors.push({
            x: startX, y: -20,
            vx: (Math.random() - 0.2) * 8 + 4,
            vy: Math.random() * 6 + 10,
            life: 0, maxLife: 20 + Math.random() * 10
        });
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        stars = [];
        layers.forEach((layer, i) => {
            for (let j = 0; j < layer.count; j++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    layer: i,
                    phase: Math.random() * Math.PI * 2
                });
            }
        });
    }

    function render(time) {
        ctx.clearRect(0, 0, width, height);
        
        // Stars
        stars.forEach(s => {
            const layer = layers[s.layer];
            s.y += layer.speed;
            if (s.y > height) s.y = -10;
            
            const twinkle = 0.5 + 0.5 * Math.sin(s.phase + time * 0.002);
            ctx.fillStyle = `rgba(200, 220, 255, ${layer.alpha * twinkle})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, layer.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Meteors
        if (Math.random() < 0.002) spawnMeteor();
        meteors = meteors.filter(m => m.life < m.maxLife);
        meteors.forEach(m => {
            m.x += m.vx; m.y += m.vy; m.life++;
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - m.life/m.maxLife})`;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.vx * 3, m.y - m.vy * 3);
            ctx.stroke();
        });
        requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(render);
})();

// --- TAPLIST DATA LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    Papa.parse(tapsURL, {
        download: true,
        header: true,
        complete: (results) => renderMenu(results.data, "live-taps-container", true)
    });

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
        if (!item.BeerName || item.BeerName.trim() === "") return;

        const isKicked = item.Status && item.Status.toLowerCase().includes("kicked");
        const statusClass = isKicked ? "kicked" : "";
        const icon = item.IconURL ? item.IconURL : "https://via.placeholder.com/100x140?text=🍺";

        const html = `
            <div class="beer-item ${statusClass}">
                <img src="${icon}" class="beer-icon" alt="label">
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