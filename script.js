const tapsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=0&output=csv";
const soonURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=1834687396&output=csv";

(function() {
    const canvas = document.getElementById("starfield");
    const ctx = canvas.getContext("2d");
    let width, height, stars = [];
    let meteors = [];
    let ships = [];

    const layers = [
        { count: 140, speed: 0.03, size: 1.2, alpha: 0.8 },
        { count: 90, speed: 0.07, size: 1.8, alpha: 0.9 },
        { count: 40, speed: 0.14, size: 2.4, alpha: 1.0 }
    ];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        stars = [];
        layers.forEach((layer, i) => {
            for (let j = 0; j < layer.count; j++) {
                stars.push({ x: Math.random() * width, y: Math.random() * height, layer: i, phase: Math.random() * Math.PI * 2 });
            }
        });
    }

    function drawMilkyWay() {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "rgba(10, 0, 30, 0)");
        gradient.addColorStop(0.5, "rgba(138, 43, 226, 0.3)");
        gradient.addColorStop(1, "rgba(10, 0, 30, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    function drawShip(ship) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(Math.atan2(ship.vy, ship.vx));
        ctx.globalAlpha = 0.5; // Subtle background ships
        ctx.fillStyle = "#ffffff";

        if (ship.type === 'trek') {
            // Tiny Enterprise Shape
            ctx.beginPath(); ctx.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2); ctx.fill(); // Saucer
            ctx.fillRect(-8, -3, 6, 1); ctx.fillRect(-8, 2, 6, 1); // Nacelles
        } else {
            // Tiny X-Wing Shape
            ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -3); ctx.lineTo(-2, 0); ctx.lineTo(-4, 3); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }

    function render(time) {
        ctx.clearRect(0, 0, width, height);
        drawMilkyWay();
        
        // Stars
        stars.forEach(s => {
            const layer = layers[s.layer];
            s.x -= layer.speed; s.y += layer.speed;
            if (s.x < -10) s.x = width + 10;
            if (s.y > height + 10) s.y = -10;
            const twinkle = 0.5 + 0.5 * Math.sin(s.phase + time * 0.002);
            ctx.fillStyle = `rgba(255, 255, 255, ${layer.alpha * twinkle})`;
            ctx.beginPath(); ctx.arc(s.x, s.y, layer.size, 0, Math.PI * 2); ctx.fill();
        });

        // Meteors - Fully dispersed start points
        if (Math.random() < 0.006) {
            meteors.push({ 
                x: Math.random() * width, 
                y: -20, 
                vx: (Math.random() - 0.5) * 6, 
                vy: Math.random() * 8 + 6, 
                life: 0, 
                maxLife: 45 
            });
        }
        meteors = meteors.filter(m => m.life < m.maxLife);
        meteors.forEach(m => {
            m.x += m.vx; m.y += m.vy; m.life++;
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - m.life / m.maxLife})`;
            ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 2, m.y - m.vy * 2); ctx.stroke();
        });

        // Random Ships - Rare and subtle
        if (Math.random() < 0.0007) {
            const fromLeft = Math.random() > 0.5;
            ships.push({
                x: fromLeft ? -50 : width + 50,
                y: Math.random() * height,
                vx: fromLeft ? (Math.random() * 1.5 + 1) : -(Math.random() * 1.5 + 1),
                vy: (Math.random() - 0.5) * 0.3,
                type: Math.random() > 0.5 ? 'trek' : 'wars'
            });
        }
        ships = ships.filter(s => s.x > -100 && s.x < width + 100);
        ships.forEach(s => {
            s.x += s.vx; s.y += s.vy;
            drawShip(s);
        });

        requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(render);
})();

document.addEventListener("DOMContentLoaded", () => {
    const renderMenu = (data, containerId, isLive) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = ""; 
        data.forEach(item => {
            if (!item.BeerName || item.BeerName.trim() === "") return;
            const icon = item.IconURL || "https://via.placeholder.com/100x140?text=🍺";
            
            // Layout with Tap Column inside
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