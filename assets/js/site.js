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
document.querySelectorAll('.mail:not(.mailc)').forEach(mail => {
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

// Tabbed page viewers (several pages of one website in one browser frame)
document.querySelectorAll('.viewer').forEach(v => {
  const tabs = v.querySelectorAll('.viewer-tabs button');
  const panes = v.querySelectorAll('.viewer-pane');
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.setAttribute('aria-selected', b === btn));
    panes.forEach((p, i) => { p.hidden = i !== +btn.dataset.i; if (!p.hidden) p.scrollTop = 0; });
  }));
});

// In-page jumps: lazy images above the target can load mid-scroll and push it down,
// so after the smooth scroll settles, re-align until the target sits under the header.
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href').length < 2) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  let tries = 0;
  const settle = () => {
    const off = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const delta = target.getBoundingClientRect().top - off;
    if (Math.abs(delta) > 4 && tries++ < 6) { scrollBy({ top: delta, behavior: 'instant' }); setTimeout(settle, 350); }
  };
  setTimeout(settle, 900);
});

// Viewer tabs with data-live: show a "view this page live" link for the selected page
document.querySelectorAll('.viewer').forEach(v => {
  const link = v.querySelector('.viewer-live');
  if (!link) return;
  const sync = () => {
    const url = v.querySelector('.viewer-tabs button[aria-selected="true"]')?.dataset.live;
    link.hidden = !url;
    if (url) link.querySelector('a').href = url;
  };
  v.querySelectorAll('.viewer-tabs button').forEach(b => b.addEventListener('click', () => setTimeout(sync)));
  sync();
});

// Andrews email comparer: audience tabs × previous/rewrite toggle, per-pane A/B subjects, stats strip
document.querySelectorAll('.mailc').forEach(box => {
  const panes = [...box.querySelectorAll('.cmp-pane')];
  const stats = box.querySelector('.cmp-stats');
  const badge = box.querySelector('.ver-badge');
  const show = () => {
    const { aud, ver } = box.dataset;
    panes.forEach(p => { p.hidden = !(p.dataset.aud === aud && p.dataset.ver === ver); });
    const p = panes.find(p => !p.hidden);
    box.querySelectorAll('.cmp-aud button').forEach(b => b.setAttribute('aria-selected', b.dataset.aud === aud));
    box.querySelectorAll('.cmp-ver button').forEach(b => b.setAttribute('aria-pressed', b.dataset.ver === ver));
    badge.textContent = ver === 'old' ? 'Previous version' : 'My rewrite';
    box.classList.toggle('is-old', ver === 'old');
    stats.querySelector('.cs-ver').textContent = ver === 'old' ? 'Previous send (Jan 6)' : 'My send (Jan 19)';
    const has = !!p.dataset.opens;
    stats.classList.toggle('no-data', !has);
    stats.querySelector('.cs-opens').textContent = has ? p.dataset.opens : '—';
    stats.querySelector('.cs-clicks').textContent = has ? p.dataset.clicks : '—';
    stats.querySelector('.cs-words').textContent = p.dataset.words + ' words' + (has ? '' : ' · no data for the earlier send');
  };
  box.querySelectorAll('.cmp-aud button').forEach(b => b.addEventListener('click', () => { box.dataset.aud = b.dataset.aud; show(); }));
  box.querySelectorAll('.cmp-ver button').forEach(b => b.addEventListener('click', () => { box.dataset.ver = b.dataset.ver; show(); }));
  panes.forEach(p => {
    const subj = p.querySelector('.mail-subject'); const opts = JSON.parse(subj.dataset.subjects);
    p.querySelectorAll('.ab button').forEach(btn => btn.addEventListener('click', () => {
      subj.textContent = opts[+btn.dataset.i];
      p.querySelectorAll('.ab button').forEach(b => b.setAttribute('aria-pressed', b === btn));
    }));
  });
  show();
});
