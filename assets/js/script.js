/* ─── Theme (Dark / Light) ─── */
(function () {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
    }
})();

function applyTheme(isDark) {
    const html = document.documentElement;
    const moon = document.getElementById('icon-moon');
    const sun = document.getElementById('icon-sun');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (isDark) {
        html.classList.add('dark');
        if (moon) moon.style.display = 'none';
        if (sun) sun.style.display = '';
        if (meta) meta.setAttribute('content', '#0a0a0f');
    } else {
        html.classList.remove('dark');
        if (moon) moon.style.display = '';
        if (sun) sun.style.display = 'none';
        if (meta) meta.setAttribute('content', '#fafafa');
    }
}

document.addEventListener('DOMContentLoaded', function () {

    /* ── apply saved theme on load ── */
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark);

    /* ── theme toggle button ── */
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            const dark = document.documentElement.classList.contains('dark');
            applyTheme(!dark);
            localStorage.setItem('theme', dark ? 'light' : 'dark');
        });
    }

    /* ── navbar scroll effect ── */
    const navbar = document.getElementById('navbar');
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /* ── mobile menu ── */
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    /* ── scroll reveal ── */
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) {
        revealObserver.observe(el);
    });

    /* ── animated stat numbers ── */
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    function animateNumber(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1200;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const numObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = '1';
                animateNumber(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(function (el) {
        numObserver.observe(el);
    });

});

/* ── smooth scroll helpers ── */
function smoothScroll(e, selector) {
    e.preventDefault();
    const target = document.querySelector(selector);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
}

function mobileSmoothScroll(e, selector) {
    e.preventDefault();
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) mobileNav.classList.remove('open');
    const target = document.querySelector(selector);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
}

/* ── copy to clipboard ── */
function copyText(btn) {
    const text = btn.getAttribute('data-copy');
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
        const origHTML = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
        setTimeout(function () {
            btn.classList.remove('copied');
            btn.innerHTML = origHTML;
        }, 2000);
    });
}