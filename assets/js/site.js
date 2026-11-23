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

// Editable copy. In index.html, text Bryan writes lives in data-copy="…" attributes:
// search "placeholder", replace the words between the quotes, and this puts it on the page.
// Anything still starting with "placeholder for" is highlighted (.ph in home.css) and listed in the console.
const isPlaceholder = v => /^\s*placeholder for/i.test(v);
const remaining = [];
document.querySelectorAll('[data-copy]').forEach(el => {
  const value = el.dataset.copy;
  el.textContent = value; // plain text only: typed < or & show as-is
  if (isPlaceholder(value)) { el.classList.add('ph'); remaining.push(value); }
});
document.querySelectorAll('[data-email]').forEach(a => {
  const value = a.dataset.email.trim();
  if (isPlaceholder(value)) { a.classList.add('ph-link'); remaining.push(value); }
  else a.href = 'mailto:' + value;
});
if (remaining.length) {
  console.warn(`[portfolio] ${remaining.length} placeholder(s) left to fill in (search index.html for the text):`);
  remaining.forEach(v => console.warn('  • ' + v));
}

// Email mockups: Inbox view / Original template tabs, and A/B subject switch
document.querySelectorAll('.mail').forEach(mail => {
  mail.querySelectorAll('.mail-tabs button').forEach(btn => btn.addEventListener('click', () => {
    mail.dataset.view = btn.dataset.show;
    mail.querySelectorAll('.mail-tabs button').forEach(b => b.setAttribute('aria-selected', b === btn));
  }));
  const subject = mail.querySelector('.mail-subject[data-subjects]');
  if (subject) {
    const options = JSON.parse(subject.dataset.subjects);
    mail.querySelectorAll('.ab button').forEach(btn => btn.addEventListener('click', () => {
      subject.textContent = options[+btn.dataset.i];
      mail.querySelectorAll('.ab button').forEach(b => b.setAttribute('aria-pressed', b === btn));
    }));
  }
});
