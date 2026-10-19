/* ═══════════════════════════════════════════════════════════════════════════
   GENJUTSU MOTION & INTERACTION · BEDUL PORTFOLIO
   Theme switching, interactive sumi-e ink canvas, scroll observers & micro-interactions
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Synchronous Theme Initialization ─── */
(function () {
    const root = document.documentElement;
    let saved = null;
    try {
        saved = localStorage.getItem('theme');
    } catch (e) {}

    // Default to dark (Notan ground) as in Genjutsu design principles
    if (saved === 'light') {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
    } else {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
    }
})();

function applyTheme(isDark) {
    const root = document.documentElement;
    const moon = document.getElementById('icon-moon');
    const sun = document.getElementById('icon-sun');
    const meta = document.querySelector('meta[name="theme-color"]');

    if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        if (moon) moon.style.display = 'none';
        if (sun) sun.style.display = '';
        if (meta) meta.setAttribute('content', '#0b0b0c');
    } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        if (moon) moon.style.display = '';
        if (sun) sun.style.display = 'none';
        if (meta) meta.setAttribute('content', '#f7f4ee');
    }
}

document.addEventListener('DOMContentLoaded', function () {

    /* ── Apply Current Theme on Load ── */
    const isDark = document.documentElement.classList.contains('dark') ||
                   document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark);

    /* ── Theme Toggle Button ── */
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                                  document.documentElement.classList.contains('dark');
            const targetDark = !currentlyDark;
            applyTheme(targetDark);
            try {
                localStorage.setItem('theme', targetDark ? 'dark' : 'light');
            } catch (e) {}
        });
    }

    /* ── Navbar Hairline Border on Scroll ── */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        function handleScroll() {
            if (window.scrollY > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    /* ── Mobile Navigation Drawer ── */
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    /* ── Scroll Reveal Observer ── */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        revealEls.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    /* ── Tabular Stat Number Counter Animation ── */
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    function animateNumber(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1200;
        const start = performance.now();

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            // Cubic ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target + suffix;
            }
        }
        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
        const numObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = '1';
                    animateNumber(entry.target);
                    numObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        statNumbers.forEach(function (el) {
            numObserver.observe(el);
        });
    } else {
        statNumbers.forEach(function (el) {
            animateNumber(el);
        });
    }

    /* ── Interactive Sumi-e Ink Particle Canvas ── */
    initInkCanvas();
});

/* ─── Interactive Sumi-e Ink Thread / Trail Canvas ─── */
function initInkCanvas() {
    const canvas = document.getElementById('ink-canvas');
    if (!canvas) return;

    // Honor prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles = [];
    const maxParticles = 40;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });

    class InkParticle {
        constructor(x, y, isRed) {
            this.x = x + (Math.random() - 0.5) * 8;
            this.y = y + (Math.random() - 0.5) * 8;
            this.radius = Math.random() * 4 + 2;
            this.maxRadius = this.radius * (Math.random() * 3 + 2.5);
            this.life = 1.0;
            this.decay = Math.random() * 0.018 + 0.012;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.isRed = isRed;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.radius += (this.maxRadius - this.radius) * 0.05;
            this.life -= this.decay;
        }

        draw(ctx, isDark) {
            if (this.life <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

            if (this.isRed) {
                // Crimson seal wisp
                ctx.fillStyle = isDark
                    ? `rgba(217, 72, 83, ${this.life * 0.35})`
                    : `rgba(177, 21, 35, ${this.life * 0.28})`;
            } else {
                // Sumi-e ink wisp
                ctx.fillStyle = isDark
                    ? `rgba(240, 236, 228, ${this.life * 0.07})`
                    : `rgba(26, 22, 20, ${this.life * 0.06})`;
            }
            ctx.fill();
        }
    }

    let lastX = 0;
    let lastY = 0;
    let isMoving = false;

    function addInk(x, y) {
        const dx = x - lastX;
        const dy = y - lastY;
        const dist = Math.hypot(dx, dy);

        if (dist > 8) {
            const isCrimsonWisp = Math.random() < 0.18;
            particles.push(new InkParticle(x, y, isCrimsonWisp));
            if (particles.length > maxParticles) {
                particles.shift();
            }
            lastX = x;
            lastY = y;
        }
    }

    window.addEventListener('mousemove', function (e) {
        addInk(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
        if (e.touches && e.touches[0]) {
            addInk(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    function render() {
        ctx.clearRect(0, 0, width, height);

        const isDark = document.documentElement.getAttribute('data-theme') !== 'light' &&
                       document.documentElement.classList.contains('dark');

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw(ctx, isDark);
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(render);
    }
    render();
}

/* ─── Smooth Scroll Helper ─── */
function smoothScroll(e, selector) {
    if (e && e.preventDefault) e.preventDefault();
    const target = document.querySelector(selector);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

function mobileSmoothScroll(e, selector) {
    if (e && e.preventDefault) e.preventDefault();
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) mobileNav.classList.remove('open');
    const target = document.querySelector(selector);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

/* ─── Copy to Clipboard ─── */
function copyText(btn) {
    const text = btn.getAttribute('data-copy');
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
        const origHTML = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg> Copied';
        setTimeout(function () {
            btn.classList.remove('copied');
            btn.innerHTML = origHTML;
        }, 2000);
    });
}