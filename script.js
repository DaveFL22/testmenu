const tapsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=0&output=csv";
const soonURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=1834687396&output=csv";

(function() {
    const canvas = document.getElementById("starfield");
    const ctx = canvas.getContext("2d");
    let width, height, stars = [], meteors = [], ships = [];

    const layers = [
        { count: 140, speed: 0.03, size: 1.2, alpha: 0.8 },
        { count: 90, speed: 0.07, size: 1.8, alpha: 0.9 },
        { count: 40, speed: 0.14, size: 2.4, alpha: 1.0 }
    ];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function drawShip(ship) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(Math.atan2(ship.vy, ship.vx));
        ctx.globalAlpha = 0.5; // Realistic transparency for background depth

        if (ship.type === 'trek') {
            // USS Enterprise Style
            let grad = ctx.createLinearGradient(0, -5, 0, 5);
            grad.addColorStop(0, "#e0e0e0"); grad.addColorStop(1, "#888");
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.ellipse(4, 0, 15, 9, 0, 0, Math.PI * 2); ctx.fill(); // Saucer
            ctx.fillRect(-12, -1, 12, 3); // Engineering Hull
            // Blue Engine Glow
            ctx.shadowBlur = 10; ctx.shadowColor = "#00f";
            ctx.fillStyle = "#4af";
            ctx.fillRect(-15, -7, 12, 2.5); ctx.fillRect(-15, 5, 12, 2.5); 
        } 
        else if (ship.type === 'deathstar') {
            // Death Star Style
            let grad = ctx.createRadialGradient(-5, -5, 2, 0, 0, 20);
            grad.addColorStop(0, "#999"); grad.addColorStop(1, "#333");
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
            // Surface Trench
            ctx.strokeStyle = "#111"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.stroke();
            // Dish & Green Glow
            ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(8, -7, 6, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 5; ctx.shadowColor = "#0f0";
            ctx.fillStyle = "#040"; ctx.beginPath(); ctx.arc(8, -7, 1.5, 0, Math.PI * 2); ctx.fill();
        } 
        else {
            // X-Wing Style
            ctx.fillStyle = "#ccc";
            ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(-10, -3); ctx.lineTo(-10, 3); ctx.closePath(); ctx.fill(); 
            // Wings & Orange Glow
            ctx.strokeStyle = "#999"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-12, -8); ctx.moveTo(-5, 0); ctx.lineTo(-12, 8); ctx.stroke();
            ctx.shadowBlur = 8; ctx.shadowColor = "#f40";
            ctx.fillStyle = "#f90";
            ctx.beginPath(); ctx.arc(-11, -4, 2, 0, Math.PI * 2); ctx.arc(-11, 4, 2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    function render(time) {
        ctx.clearRect(0, 0, width, height);
        
        // Render Stars
        stars.forEach(s => {
            const layer = layers[s.layer];
            s.x -= layer.speed; s.y += layer.speed;
            if (s.x < -10) s.x = width + 10;
            if (s.y > height + 10) s.y = -10;
            ctx.fillStyle = `rgba(255, 255, 255, ${layer.alpha})`;
            ctx.beginPath(); ctx.arc(s.x, s.y, layer.size, 0, Math.PI * 2); ctx.fill();
        });

        // Render Meteors (Rare: 0.0015 chance)
        if (Math.random() < 0.0015) {
            meteors.push({ x: Math.random() * width, y: -20, vx: (Math.random() - 0.5) * 6, vy: Math.random() * 8 + 6, life: 0, maxLife: 45 });
        }
        meteors = meteors.filter(m => m.life < m.maxLife);
        meteors.forEach(m => {
            m.x += m.vx; m.y += m.vy; m.life++;
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - m.life / m.maxLife})`;
            ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 2, m.y - m.vy * 2); ctx.stroke();
        });

        // Render Ships (Rare: 0.0003 chance)
        if (Math.random() < 0.0003) {
            const startEdge = Math.floor(Math.random() * 4);
            let startX, startY, vx, vy;
            const speed = Math.random() * 0.7 + 0.3;

            if (startEdge === 0) { startX = Math.random() * width; startY = -60; vx = (Math.random()-0.5)*speed; vy = speed; }
            else if (startEdge === 1) { startX = Math.random() * width; startY = height + 60; vx = (Math.random()-0.5)*speed; vy = -speed; }
            else if (startEdge === 2) { startX = -60; startY = Math.random() * height; vx = speed; vy = (Math.random()-0.5)*speed; }
            else { startX = width + 60; startY = Math.random() * height; vx = -speed; vy = (Math.random()-0.5)*speed; }
            
            const rand = Math.random();
            const type = rand < 0.15 ? 'deathstar' : (rand < 0.5 ? 'trek' : 'wars');
            ships.push({ x: startX, y: startY, vx, vy, type });
        }
        ships = ships.filter(s => s.x > -150 && s.x < width + 150 && s.y > -150 && s.y < height + 150);
        ships.forEach(s => { s.x += s.vx; s.y += s.vy; drawShip(s); });

        requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);
    resize();
    // Initialize stars
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < layers[i].count; j++) {
            stars.push({ x: Math.random() * width, y: Math.random() * height, layer: i });
        }
    }
    requestAnimationFrame(render);
})();

document.addEventListener("DOMContentLoaded", () => {
    const renderMenu = (data, containerId, isLive) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = ""; 
        data.forEach(item => {
            if (!item.BeerName) return;
            const icon = item.IconURL || "https://via.placeholder.com/85x110?text=🍺";
            const tapLabel = (isLive && item.Tap) ? `<div class="tap-column"><span class="tap-num">TAP</span><span class="tap-id">${item.Tap}</span></div>` : "";
            container.innerHTML += `
                <div class="beer-item">
                    <img src="${icon}" class="beer-icon" alt="label">
                    ${tapLabel}
                    <div class="beer-info">
                        <h2>${item.BeerName}</h2>
                        <p class="beer-details">${item.Style} • ${item.ABV}%</p>
                        <p class="beer-notes">${item.Notes}</p>
                    </div>
                </div>`;
        });
    };
    Papa.parse(tapsURL, { download: true, header: true, complete: (r) => renderMenu(r.data, "live-taps-container", true) });
    Papa.parse(soonURL, { download: true, header: true, complete: (r) => renderMenu(r.data, "coming-soon-container", false) });
});