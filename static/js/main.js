/**
 * Main JavaScript for Sanggar Bunda Sari
 * Handles global interactions, animations, and responsive features.
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initNavbarScroll();
    initBackToTop();
    initMobileMenuGlobal();
    initCounters(); // Safe to call even if no counters exist
});

/**
 * 1. Global Scroll Reveal Animations
 * Uses IntersectionObserver to trigger animations when elements enter viewport
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .animate-fade-in, .animate-slide-up');
    revealElements.forEach(el => observer.observe(el));
}

/**
 * 2. Dynamic Navbar Glass Effect
 */
function initNavbarScroll() {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Check initial state
    if (window.scrollY > 50) header.classList.add('scrolled');
}

/**
 * 3. Back to Top Button
 */
function initBackToTop() {
    // Create button dynamically if not exists
    if (!document.querySelector('.back-to-top')) {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.innerHTML = '<i class="bi bi-arrow-up"></i>';
        btn.ariaLabel = 'Kembali ke atas';
        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
    }
}

/**
 * 4. Centralized Mobile Menu Logic
 * Replaces inline scripts for better maintainability
 */
function initMobileMenuGlobal() {
    window.toggleMobileMenu = function () {
        const menu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('mobileMenuOverlay');
        const toggle = document.getElementById('menuToggle');

        if (!menu || !overlay || !toggle) return;

        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        toggle.classList.toggle('active');

        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    };

    window.closeMobileMenu = function () {
        const menu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('mobileMenuOverlay');
        const toggle = document.getElementById('menuToggle');

        if (!menu || !overlay || !toggle) return;

        menu.classList.remove('active');
        overlay.classList.remove('active');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Resize handler
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) window.closeMobileMenu();
    });
}

/**
 * 5. Number Counter Animation (for Dashboard/Home stats)
 */
function initCounters() {
    // Select elements with data-count attribute or specific IDs
    // This is a generic helper that can be called by specific pages
}

/* Helper to animate numbers */
window.animateValue = function (id, start, end, duration, isDecimal = false) {
    const element = document.getElementById(id);
    if (!element) return;

    // Parse inputs to ensure they are numbers
    start = parseFloat(start);
    end = parseFloat(end);

    if (isNaN(start) || isNaN(end)) return;

    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / (range || 1))); // prevent div/0

    let current = start;
    const timer = setInterval(() => {
        current += increment;
        // Check completion
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = isDecimal ? end.toFixed(1) : Math.round(end);
            clearInterval(timer);
        } else {
            element.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
        }
    }, Math.max(stepTime, 10)); // Min 10ms step
};
