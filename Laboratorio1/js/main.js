/**
 * Auto Lavado Multiservicios VH — main.js (v2)
 * Tema (localStorage) + hamburger
 */

const THEME_KEY = 'autolavado_theme';
const themeBtn  = document.getElementById('theme-toggle');
const body      = document.body;

function updateThemeIcon(isLight) {
  if (!themeBtn) return;
  themeBtn.textContent = isLight ? '🌙' : '☀️';
  themeBtn.setAttribute('aria-label', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
}

function applyStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
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

function toggleTheme() {
  const isLight = body.classList.toggle('light-mode');
  localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  updateThemeIcon(isLight);
  if (themeBtn) themeBtn.setAttribute('aria-pressed', String(isLight));
}

if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
applyStoredTheme();

/* Hamburger */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* Navbar scroll */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.background = window.scrollY > 30
    ? 'rgba(5,13,26,0.98)'
    : 'rgba(5,13,26,0.92)';
}, { passive: true });

/* Smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }
  });
});
