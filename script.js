// --- CONFIGURATION ---
// These URLs point to your Google Sheets published as CSV
const tapsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=0&output=csv";
const soonURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbhe0mAO87tCxmxTZpwy57KOu5SsAd6Aa93gOru_TzBwhD4fKfMn2gOzJlso9i0K1nces50guB_wA8/pub?gid=1834687396&output=csv";

// --- STARFIELD & NEBULA ENGINE ---
(function() {
    const canvas = document.getElementById("starfield");
    const ctx = canvas.getContext("2d");
    let width, height, stars = [];
    
    // Star Layers: count, movement speed, base size, and brightness (alpha)
    const layers = [
        { count: 180, speed: 0.03, size: 1.1, alpha: 0.7 },
        { count: 120, speed: 0.06, size: 1.4, alpha: 0.8 },
        { count: 60, speed: 0.10, size: 1.9, alpha: 1.0 }
    ];
    let meteors = [];

    // Adjust canvas size and initialize star positions
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
                    phase: Math.random() * Math.PI * 2 // Initial phase for twinkling
                });
            }
        });
    }

    // Draws the "Milky Way" nebula effect using a radial gradient
    function drawMilkyWay() {
        // Core position (Top Right)
        const centerX = width * 0.75;
        const centerY = height * 0.25;
        const radius = Math.max(width, height) * 0.9;

        const nebulaGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        nebulaGrad.addColorStop(0, "rgba(75, 0, 130, 0.3)");   // Deep Indigo center
        nebulaGrad.addColorStop(0.3, "rgba(138, 43, 226, 0.15)"); // Starbase Purple glow
        nebulaGrad.addColorStop(0.7, "rgba(48, 25, 52, 0.08)");  // Outer edge purple
        nebulaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");          // Fade to black

        ctx.save();
        // 'screen' mode blends colors beautifully on dark backgrounds
        ctx.globalCompositeOperation = "screen"; 
        ctx.fillStyle = nebulaGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    function render(time) {
        ctx.clearRect(0, 0, width, height);
        
        // 1. Draw Nebula background
        drawMilkyWay();
        
        // 2. Render and animate Stars
        stars.forEach(s => {
            const layer = layers[s.layer];
            
            // DIAGONAL MOVEMENT (Top-Right to Bottom-Left)
            s.x -= layer.speed;
            s.y += layer.speed;

            // Reset stars that move off-screen
            if (s.x < -20) s.x = width + 20;
            if (s.y > height + 20) s.y = -20;
            
            // SUPERNOVA Logic: Random flare-ups
            let supernovaBoost = 1;
            if (Math.random() < 0.0008) supernovaBoost = 5;

            // Simple Sine wave for twinkling
            const twinkle = 0.5 + 0.5 * Math.sin(s.phase + time * 0.002);
            
            ctx.fillStyle = `rgba(230, 240, 255, ${layer.alpha * twinkle * supernovaBoost})`;
            const size = supernovaBoost > 1 ? layer.size * 2.5 : layer.size;
            
            ctx.beginPath();
            ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
            ctx.fill();
        });

        // 3. Render Shooting Stars (Meteors)
        if (Math.random() < 0.0025) {
            meteors.push({
                x: width + 50, 
                y: Math.random() * (height / 2),
                vx: - (Math.random() * 8 + 6),
                vy: Math.random() * 5 + 5,
                life: 0, 
                maxLife: 35
            });
        }
        
        meteors = meteors.filter(m => m.life < m.maxLife);
        meteors.forEach(m => {
            m.x += m.vx; 
            m.y += m.vy; 
            m.life++;
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - m.life / m.maxLife})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.vx * 3, m.y - m.vy * 3);
            ctx.stroke();
        });

        requestAnimationFrame(render);
    }

    // Handle screen resizing
    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(render);
})();

// --- DATA HANDLING ---
document.addEventListener("DOMContentLoaded", () => {
    
    // Function to build HTML for each beer card
    const renderMenu = (data, containerId, isLive) => {
        const container = document.getElementById(containerId);
        container.innerHTML = ""; // Clear "Loading" message

        data.forEach(item => {
            // Skip empty rows in the sheet
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
    };

    // Fetch and parse the CSV data from Google Sheets
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