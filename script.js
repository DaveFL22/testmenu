const tapsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=0&output=csv";
const soonURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=1834687396&output=csv";

// --- STARFIELD & NEBULA ENGINE ---
(function() {
    const canvas = document.getElementById("starfield");
    const ctx = canvas.getContext("2d");
    let width, height, stars = [];
    
    const layers = [
        { count: 140, speed: 0.03, size: 1.2, alpha: 0.9 },
        { count: 90, speed: 0.07, size: 1.8, alpha: 1.0 },
        { count: 40, speed: 0.14, size: 2.4, alpha: 1.0 }
    ];
    let meteors = [];

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

    function render(time) {
        ctx.clearRect(0, 0, width, height);
        drawMilkyWay();
        
        stars.forEach(s => {
            const layer = layers[s.layer];
            s.x -= layer.speed;
            s.y += layer.speed;

            if (s.x < -20) s.x = width + 20;
            if (s.y > height + 20) s.y = -20;
            
            let supernovaBoost = (Math.random() < 0.0015) ? 6 : 1;
            const twinkle = 0.5 + 0.5 * Math.sin(s.phase + time * 0.003);
            
            ctx.fillStyle = `rgba(255, 255, 255, ${layer.alpha * twinkle * supernovaBoost})`;
            const size = supernovaBoost > 1 ? layer.size * 2 : layer.size;
            
            ctx.beginPath();
            ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
            ctx.fill();
        });

        if (Math.random() < 0.004) {
            meteors.push({
                x: width + 50, y: Math.random() * (height / 2),
                vx: - (Math.random() * 12 + 10), vy: Math.random() * 8 + 8,
                life: 0, maxLife: 35
            });
        }
        meteors = meteors.filter(m => m.life < m.maxLife);
        meteors.forEach(m => {
            m.x += m.vx; m.y += m.vy; m.life++;
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - m.life / m.maxLife})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.vx * 2, m.y - m.vy * 2);
            ctx.stroke();
        });

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
            const tapLabel = (isLive && item.Tap) ? `<span class="tap-num">TAP ${item.Tap}</span>` : "";

            container.innerHTML += `
                <div class="beer-item">
                    <img src="${icon}" class="beer-icon" alt="label">
                    <div class="beer-info">
                        ${tapLabel}
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