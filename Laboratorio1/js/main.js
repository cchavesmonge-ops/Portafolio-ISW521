/**
 * Auto Lavado Multiservicios VH — main.js
 * Web Storage (localStorage) + interacciones generales
 */

/* =============================================
   1. THEME TOGGLE — localStorage persistence
   ============================================= */
const THEME_KEY = 'autolavado_theme'; // clave en localStorage

const themeBtn   = document.getElementById('theme-toggle');
const body       = document.body;

/**
 * Aplica el tema guardado al cargar la página.
 * Recupera el valor de localStorage y, si existe,
 * lo aplica antes del primer render visible.
 */
function applyStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY); // leer localStorage
  if (stored === 'light') {
    body.classList.add('light-mode');
    if (themeBtn) themeBtn.setAttribute('aria-pressed', 'true');
    updateThemeIcon(true);
  } else {
    body.classList.remove('light-mode');
    if (themeBtn) themeBtn.setAttribute('aria-pressed', 'false');
    updateThemeIcon(false);
  }
}

function updateThemeIcon(isLight) {
  if (!themeBtn) return;
  themeBtn.textContent = isLight ? '🌙' : '☀️';
  themeBtn.setAttribute('aria-label',
    isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
  );
}

function toggleTheme() {
  const isLight = body.classList.toggle('light-mode');
  // Persistir en localStorage
  localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  updateThemeIcon(isLight);

  if (themeBtn) themeBtn.setAttribute('aria-pressed', String(isLight));
  showToast(isLight ? '☀️ Modo claro activado' : '🌙 Modo oscuro activado');
}

if (themeBtn) {
  themeBtn.addEventListener('click', toggleTheme);
}

// Aplicar tema guardado al inicio
applyStoredTheme();


/* =============================================
   2. WELCOME BANNER — sessionStorage
   ============================================= */
const WELCOME_KEY = 'autolavado_welcome_seen';

function checkWelcomeBanner() {
  const seen = sessionStorage.getItem(WELCOME_KEY);
  if (!seen) {
    // Primera visita en esta sesión
    sessionStorage.setItem(WELCOME_KEY, 'true');
    setTimeout(() => {
      showToast('👋 ¡Bienvenido a Auto Lavado Multiservicios VH!');
    }, 1200);
  }
}

checkWelcomeBanner();


/* =============================================
   2b. FONT SIZE CONTROL — A / AA / AAA (localStorage)
   ============================================= */
const FONT_SIZE_KEY = 'autolavado_font_scale';

const FONT_SCALES = {
  A:   1,
  AA:  1.15,
  AAA: 1.3
};

const fontSizeBtns = document.querySelectorAll('.btn-font-size');

function applyFontScale(sizeKey) {
  const scale = FONT_SCALES[sizeKey] || 1;
  document.documentElement.style.setProperty('--font-scale', scale);

  fontSizeBtns.forEach(btn => {
    const isActive = btn.dataset.size === sizeKey;
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

function applyStoredFontScale() {
  const stored = localStorage.getItem(FONT_SIZE_KEY) || 'A';
  applyFontScale(stored);
}

fontSizeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const sizeKey = btn.dataset.size;
    localStorage.setItem(FONT_SIZE_KEY, sizeKey);
    applyFontScale(sizeKey);

    const labels = { A: 'normal', AA: 'grande', AAA: 'extra grande' };
    showToast(`🔤 Tamaño de letra: ${labels[sizeKey]}`);
  });
});

applyStoredFontScale();


/* =============================================
   3. HAMBURGER MENU
   ============================================= */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  // Cerrar al hacer clic en un enlace del menú móvil
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}


/* =============================================
   4. NAVBAR SCROLL EFFECT
   ============================================= */
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar.style.background = 'rgba(5,13,26,0.98)';
  } else {
    navbar.style.background = 'rgba(5,13,26,0.92)';
  }
}, { passive: true });


/* =============================================
   5. SMOOTH SCROLL — enlaces internos
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // altura del navbar
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* =============================================
   6. TOAST NOTIFICATION
   ============================================= */
let toastTimer = null;

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}


/* =============================================
   7. INTERSECTION OBSERVER — animaciones on scroll
   ============================================= */
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observar tarjetas y secciones
document.querySelectorAll(
  '.service-card, .package-card, .contact-card, .bonus-banner'
).forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
