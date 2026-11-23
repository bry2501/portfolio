// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
}

// Click any image with class "zoom" to view it full size
const box = document.createElement('div');
box.className = 'lightbox';
box.innerHTML = '<img alt="">';
document.body.appendChild(box);
document.querySelectorAll('img.zoom').forEach(img => {
  img.addEventListener('click', () => {
    box.firstChild.src = img.src;
    box.firstChild.alt = img.alt;
    box.classList.add('open');
  });
});
box.addEventListener('click', () => box.classList.remove('open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') box.classList.remove('open'); });

// Footer year
document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

// Sticky header shadow + highlight the nav link for the section in view
const header = document.querySelector('.site-header');
const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if (sections.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => io.observe(s));
}

// Placeholder report: lists text Bryan still needs to write (see .ph in home.css)
const placeholders = document.querySelectorAll('.ph, .ph-link');
if (placeholders.length) {
  console.warn(`[portfolio] ${placeholders.length} placeholder(s) left to fill in:`);
  placeholders.forEach(el => {
    const section = el.closest('section[id]')?.id || 'hero';
    console.warn(`  • #${section}: ${el.dataset.ph || el.textContent.trim()}`, el);
  });
}
