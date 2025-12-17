const AD_LINK = "https://www.effectivegatecpm.com/hegdhug3p?key=0de6a8587958b2e9a855ea7aa8df5c0c";

// State
let hasClickedOnce = false;
let zoomLevel = 1;
let isDragging = false;
let startX, startY, transX = 0, transY = 0;

document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
    setupAdTimer();
    setupLightboxEvents();
    initStarSystem(); // Start the interactive background
});

// --- Gallery Rendering ---
function renderGallery() {
    const container = document.getElementById('gallery');

    // Check if we have images
    if (!window.galleryImages || window.galleryImages.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:2rem; width:100%;">No images found. Use <a href="admin.html">Admin Panel</a> to add images.</p>';
        return;
    }

    window.galleryImages.forEach(src => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        // Pass the FULL path to handleImageClick so lightbox gets the correct URL
        const fullPath = 'image/' + src;
        item.onclick = () => handleImageClick(fullPath);

        const img = document.createElement('img');
        img.src = fullPath;
        img.loading = 'lazy';
        img.alt = 'Gallery Image';

        // Hide image if it fails to load
        img.onerror = () => {
            console.warn('Missing image:', fullPath);
            item.style.display = 'none';
        };

        item.appendChild(img);
        container.appendChild(item);
    });
}

// --- Ad Logic ---
function handleImageClick(src) {
    // Open Ad EVERY time an image is clicked
    openAd();
    openLightbox(src);
}

function setupAdTimer() {
    setInterval(() => {
        openAd();
    }, 60000);
}

function openAd() {
    const adWindow = window.open(AD_LINK, '_blank');
    if (adWindow) {
        window.focus();
    }
}

// --- Lightbox & Zoom Logic ---
function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    lightboxImg.src = src;
    transX = 0;
    transY = 0;
    zoomLevel = 1;
    updateTransform(lightboxImg);

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function setupLightboxEvents() {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');

    closeBtn.onclick = closeLightbox;
    lightbox.onclick = (e) => {
        if (e.target === lightbox) closeLightbox();
    };

    lightbox.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newZoom = Math.min(Math.max(1, zoomLevel + delta), 4);

        zoomLevel = newZoom;
        updateTransform(img);

        if (zoomLevel > 1) img.classList.add('zoomed');
        else img.classList.remove('zoomed');
    });

    img.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', endDrag);

    img.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) startDrag(e.touches[0]);
    });
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) drag(e.touches[0]);
    });
    window.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    if (zoomLevel <= 1) return;
    isDragging = true;
    startX = e.clientX - transX;
    startY = e.clientY - transY;
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    transX = e.clientX - startX;
    transY = e.clientY - startY;

    const img = document.getElementById('lightbox-img');
    updateTransform(img);
}

function endDrag() {
    isDragging = false;
}

function updateTransform(el) {
    el.style.transform = `translate(${transX}px, ${transY}px) scale(${zoomLevel})`;
}

// --- Interactive Star Background ---
function initStarSystem() {
    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'star-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    const starCount = 100;
    const connectionDist = 150;

    let mouse = { x: null, y: null };

    // Resize
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    // Mouse Track
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    // Star Class
    class Star {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5; // Slow movement
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.color = `rgba(255, 255, 255, ${Math.random()})`;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse Interaction: Move away from mouse slightly
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const angle = Math.atan2(dy, dx);
                this.x -= Math.cos(angle) * 1;
                this.y -= Math.sin(angle) * 1;
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Init Stars
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update & Draw Stars
        stars.forEach(star => {
            star.update();
            star.draw();
        });

        // Draw Connections
        for (let i = 0; i < stars.length; i++) {
            for (let j = i; j < stars.length; j++) {
                const dx = stars[i].x - stars[j].x;
                const dy = stars[i].y - stars[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDist) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / connectionDist})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(stars[j].x, stars[j].y);
                    ctx.stroke();
                }

                // Connect to mouse
                if (mouse.x) {
                    const mdx = stars[i].x - mouse.x;
                    const mdy = stars[i].y - mouse.y;
                    const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (mDist < connectionDist) {
                        ctx.strokeStyle = `rgba(162, 155, 254, ${1 - mDist / connectionDist})`; // Purple glow
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(stars[i].x, stars[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
}
