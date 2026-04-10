const tapsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=0&output=csv";
const soonURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=1834687396&output=csv";

// --- STARFIELD, NEBULA & MULTI-DIRECTIONAL SHIP ENGINE ---
(function() {
    const canvas = document.getElementById("starfield");
    const ctx = canvas.getContext("2d");
    let width, height, stars = [], meteors = [], ships = [];
    
    const layers = [
        { count: 140, speed: 0.03, size: 1.2, alpha: 0.9 },
        { count: 90, speed: 0.07, size: 1.8, alpha: 1.0 },
        { count: 40, speed: 0.14, size: 2.4, alpha: 1.0 }
    ];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        stars = [];
        layers.forEach((layer, i) => {
            for (let j = 0; j < layer.count; j++) {
                stars.push({
                    x: Math.random() * width, y: Math.random() * height,
                    layer: i, phase: Math.random() * Math.PI * 2
                });
            }
        });
    }

    function drawMilkyWay() {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "rgba(10, 0, 30, 0)");         
        gradient.addColorStop(0.3, "rgba(75, 0, 130, 0.3)");   
        gradient.addColorStop(0.5, "rgba(138, 43, 226, 0.6)"); 
        gradient.addColorStop(0.7, "rgba(75, 0, 130, 0.3)");   
        gradient.addColorStop(1, "rgba(10, 0, 30, 0)");         

        ctx.save();
        ctx.globalCompositeOperation = "screen"; 
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    function drawShip(ship) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(Math.atan2(ship.vy, ship.vx));
        ctx.globalAlpha = 0.5;

        if (ship.type === 'trek') {
            ctx.fillStyle = "#e0e0e0";
            ctx.beginPath(); ctx.ellipse(12, 0, 22, 16, 0, 0, Math.PI * 2); ctx.fill(); 
            ctx.beginPath();
            ctx.moveTo(2, 0);
            ctx.lineTo(-12, -6);
            ctx.lineTo(-18, 0);
            ctx.lineTo(-12, 6);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#4af"; 
            ctx.fillRect(-15, -12, 14, 4); 
            ctx.fillRect(-15, 8, 14, 4);
            ctx.fillStyle = "#f33"; 
            ctx.fillRect(-2, -12, 3, 4);
            ctx.fillRect(-2, 8, 3, 4);
        } else if (ship.type === 'wars') {
            ctx.fillStyle = "#ccc";
            ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(-12, -6); ctx.lineTo(-12, 6); ctx.closePath(); ctx.fill(); 
            ctx.strokeStyle = "#999"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-15, -12); ctx.moveTo(-3, 0); ctx.lineTo(-15, 12); ctx.stroke(); 
        } else if (ship.type === 'raider') {
            ctx.fillStyle = "#888";
            ctx.beginPath(); ctx.arc(0, 0, 15, Math.PI * 0.5, Math.PI * 1.5, true); 
            ctx.lineTo(8, 0); ctx.closePath(); ctx.fill();
            ctx.fillStyle = "#f00"; 
            ctx.fillRect(4, -2, 4, 4);
        } else if (ship.type === 'romulan') {
            ctx.fillStyle = "#2d5a27";
            ctx.beginPath();
            ctx.moveTo(18, 0); 
            ctx.quadraticCurveTo(0, -8, -12, 0);
            ctx.quadraticCurveTo(0, 8, 18, 0);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.bezierCurveTo(0, -25, 20, -25, 25, -18); 
            ctx.bezierCurveTo(15, -15, 5, -5, -8, 0);
            ctx.bezierCurveTo(5, 5, 15, 15, 25, 18); 
            ctx.bezierCurveTo(20, 25, 0, 25, -8, 0);
            ctx.fill();
            ctx.fillStyle = "#4f4";
            ctx.fillRect(15, -20, 4, 2);
            ctx.fillRect(15, 18, 4, 2);
        } else if (ship.type === 'klingon') {
            ctx.fillStyle = "#4e5452";
            ctx.fillRect(0, -1, 12, 2); 
            ctx.beginPath();
            ctx.ellipse(15, 0, 6, 4, 0, 0, Math.PI * 2); 
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-15, -18); 
            ctx.lineTo(-18, -22); 
            ctx.lineTo(-10, -15);
            ctx.lineTo(0, 0);
            ctx.lineTo(-15, 18); 
            ctx.lineTo(-18, 22); 
            ctx.lineTo(-10, 15);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#f33";
            ctx.fillRect(-12, -2, 4, 4); 
            ctx.fillRect(-16, -23, 2, 4); 
            ctx.fillRect(-16, 19, 2, 4);
        }
        ctx.restore();
    }

    function render(time) {
        ctx.clearRect(0, 0, width, height);
        drawMilkyWay();
        
        stars.forEach(s => {
            const layer = layers[s.layer];
            s.x -= layer.speed; s.y += layer.speed;
            if (s.x < -20) s.x = width + 20;
            if (s.y > height + 20) s.y = -20;
            const twinkle = 0.5 + 0.5 * Math.sin(s.phase + time * 0.003);
            ctx.fillStyle = `rgba(255, 255, 255, ${layer.alpha * twinkle})`;
            ctx.beginPath(); ctx.arc(s.x, s.y, layer.size, 0, Math.PI * 2); ctx.fill();
        });

        if (Math.random() < 0.001) {
            let startX, startY, vx, vy;
            const side = Math.floor(Math.random() * 4);
            const speed = Math.random() * 10 + 5;
            if (side === 0) { startX = Math.random() * width; startY = -50; vx = (Math.random()-0.5)*speed; vy = speed; }
            else if (side === 1) { startX = width + 50; startY = Math.random() * height; vx = -speed; vy = (Math.random()-0.5)*speed; }
            else if (side === 2) { startX = Math.random() * width; startY = height + 50; vx = (Math.random()-0.5)*speed; vy = -speed; }
            else { startX = -50; startY = Math.random() * height; vx = speed; vy = (Math.random()-0.5)*speed; }
            meteors.push({ x: startX, y: startY, vx, vy, life: 0, maxLife: 40 });
        }
        meteors = meteors.filter(m => m.life < m.maxLife);
        meteors.forEach(m => {
            m.x += m.vx; m.y += m.vy; m.life++;
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - m.life / m.maxLife})`;
            ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 1.5, m.y - m.vy * 1.5); ctx.stroke();
        });

        // SPAWNING LIMITER: Only spawn if no ships currently exist
        if (ships.length === 0 && Math.random() < 0.005) {
            const shipPool = ['trek', 'wars', 'raider', 'romulan', 'klingon'];
            const type = shipPool[Math.floor(Math.random() * shipPool.length)];
            const side = Math.floor(Math.random() * 4); 
            const speed = Math.random() * 0.8 + 0.4; 
            let sX, sY, vX, vY;

            if (side === 0) { sX = Math.random() * width; sY = -100; vX = (Math.random() - 0.5) * 0.5; vY = speed; }
            else if (side === 1) { sX = width + 100; sY = Math.random() * height; vX = -speed; vY = (Math.random() - 0.5) * 0.5; }
            else if (side === 2) { sX = Math.random() * width; sY = height + 100; vX = (Math.random() - 0.5) * 0.5; vY = -speed; }
            else { sX = -100; sY = Math.random() * height; vX = speed; vY = (Math.random() - 0.5) * 0.5; }
            
            ships.push({ x: sX, y: sY, vx: vX, vy: vY, type: type });
        }

        ships = ships.filter(s => s.x > -200 && s.x < width + 200 && s.y > -200 && s.y < height + 200);
        ships.forEach(s => { s.x += s.vx; s.y += s.vy; drawShip(s); });

        requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(render);
})();

// --- DATA ENGINE ---
document.addEventListener("DOMContentLoaded", () => {
    const renderMenu = (data, containerId, isLive) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = ""; 
        data.forEach(item => {
            if (!item.BeerName || item.BeerName.trim() === "") return;
            const icon = item.IconURL || "https://via.placeholder.com/100x140?text=🍺";
            const tapLabel = (isLive && item.Tap) ? `
                <div class="tap-column">
                    <span class="tap-num">TAP</span>
                    <span class="tap-id">${item.Tap}</span>
                </div>` : "";

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