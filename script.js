const tapsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=0&output=csv";
const soonURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=1834687396&output=csv";

// --- STARFIELD & MILKY WAY ENGINE ---
(function() {
    const canvas = document.getElementById("starfield");
    const ctx = canvas.getContext("2d");
    let width, height, stars = [];
    
    // Increased alpha values for much brighter star clusters
    const layers = [
        { count: 160, speed: 0.03, size: 1.2, alpha: 0.9 },
        { count: 100, speed: 0.07, size: 1.6, alpha: 1.0 },
        { count: 50, speed: 0.12, size: 2.2, alpha: 1.0 }
    ];
    let meteors = [];

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

    function drawMilkyWay() {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "rgba(10, 0, 30, 0)");         
        gradient.addColorStop(0.3, "rgba(75, 0, 130, 0.3)");   
        gradient.addColorStop(0.5, "rgba(138, 43, 226, 0.6)"); // High opacity core
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
            
            // Higher supernova frequency
            let supernovaBoost = (Math.random() < 0.0015) ? 6 : 1;

            const twinkle = 0.4 + 0.6 * Math.sin(s.phase + time * 0.003);
            ctx.fillStyle = `rgba(255, 255, 255, ${layer.alpha * twinkle * supernovaBoost})`;
            const size = supernovaBoost > 1 ? layer.size * 2 : layer.size;
            
            ctx.beginPath();
            ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Faster Meteors
        if (Math.random() < 0.0035) {
            meteors.push({
                x: width + 50, y: Math.random() * (height / 2),
                vx: - (Math.random() * 10 + 8),
                vy: Math.random() * 6 + 6,
                life: 0, maxLife: 40
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

// --- DATA FETCHING ---
document.addEventListener("DOMContentLoaded", () => {
    const renderMenu = (data, containerId) => {
        const container = document.getElementById(containerId);
        container.innerHTML = ""; 
        data.forEach(item => {
            if (!item.BeerName || item.BeerName.trim() === "") return;
            const icon = item.IconURL || "https://via.placeholder.com/100x140?text=🍺";
            container.innerHTML += `
                <div class="beer-item">
                    <img src="${icon}" class="beer-icon" alt="label">
                    <div class="beer-info">
                        <h2>${item.BeerName}</h2>
                        <p class="beer-details">${item.Style} • ${item.ABV}%</p>
                        <p class="beer-notes">${item.Notes}</p>
                    </div>
                </div>`;
        });
    };

    Papa.parse(tapsURL, { download: true, header: true, complete: (r) => renderMenu(r.data, "live-taps-container") });
    Papa.parse(soonURL, { download: true, header: true, complete: (r) => renderMenu(r.data, "coming-soon-container") });
});