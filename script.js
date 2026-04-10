// --- CONFIGURATION ---
const tapsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=0&output=csv";
const soonURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=1834687396&output=csv";

// --- STARFIELD ENGINE (Diagonal & Bright) ---
(function() {
    const canvas = document.getElementById("starfield");
    const ctx = canvas.getContext("2d");
    let width, height, stars = [];
    
    // Increased alpha values for extra brightness
    const layers = [
        { count: 180, speed: 0.03, size: 1.1, alpha: 0.6 },
        { count: 120, speed: 0.06, size: 1.4, alpha: 0.8 },
        { count: 60, speed: 0.10, size: 1.9, alpha: 1.0 }
    ];
    let meteors = [];

    function spawnMeteor() {
        // Meteor spawning adjusted to cross diagonally
        const startX = width + 50;
        meteors.push({
            x: startX, y: Math.random() * (height / 2),
            vx: - (Math.random() * 8 + 6),
            vy: Math.random() * 5 + 5,
            life: 0, maxLife: 30 + Math.random() * 20
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
        
        stars.forEach(s => {
            const layer = layers[s.layer];
            
            // DIAGONAL MOVEMENT: Top-Right to Bottom-Left
            s.x -= layer.speed;
            s.y += layer.speed;

            // Reset logic for diagonal flow
            if (s.x < -10) s.x = width + 10;
            if (s.y > height + 10) s.y = -10;
            
            let supernovaBoost = 1;
            if (Math.random() < 0.0008) supernovaBoost = 4 + Math.random() * 3;

            const twinkle = 0.5 + 0.5 * Math.sin(s.phase + time * 0.002);
            const alpha = layer.alpha * twinkle * supernovaBoost;
            const size = supernovaBoost > 1 ? layer.size * 2.5 : layer.size;

            ctx.fillStyle = `rgba(230, 240, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
            ctx.fill();
        });

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