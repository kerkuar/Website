/* Andi Shehu — shared site behaviour */
'use strict';

/* ---------- THEME ---------- */
(function () {
    const html = document.documentElement;
    html.setAttribute('data-theme', localStorage.getItem('as-theme') || 'light');
    document.addEventListener('DOMContentLoaded', () => {
        const t = document.getElementById('themeToggle');
        if (!t) return;
        t.addEventListener('click', () => {
            const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', next);
            localStorage.setItem('as-theme', next);
        });
    });
})();

/* ---------- NAV ---------- */
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const updateNav = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
        window.addEventListener('scroll', updateNav, { passive: true });
        updateNav();
    }

    /* Highlight current page in nav */
    const here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        const target = href.split('#')[0] || 'index.html';
        if (target === here) a.classList.add('active');
    });

    /* Hamburger */
    const ham = document.getElementById('hamburger');
    const mob = document.getElementById('mobileNav');
    if (ham && mob) {
        ham.addEventListener('click', () => {
            ham.classList.toggle('open');
            mob.classList.toggle('open');
        });
        mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            ham.classList.remove('open');
            mob.classList.remove('open');
        }));
    }

    /* Fade-in observer */
    const io = new IntersectionObserver(entries => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('visible'), i * 60);
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

    /* Ripple on buttons */
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const r = document.createElement('span');
            r.classList.add('ripple');
            const rect = this.getBoundingClientRect();
            const sz = Math.max(rect.width, rect.height) * 2;
            r.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX-rect.left-sz/2}px;top:${e.clientY-rect.top-sz/2}px`;
            this.appendChild(r);
            r.addEventListener('animationend', () => r.remove());
        });
    });
});

/* ---------- TOAST helper (used by other scripts) ---------- */
window.showToast = function (msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(window._toastT);
    window._toastT = setTimeout(() => t.classList.remove('show'), 3200);
};

/* ---------- Date helper for article cards ---------- */
window.formatArticleDate = function (iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};
