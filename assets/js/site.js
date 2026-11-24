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

// Andrews email comparer: audience tabs; previous version and rewrite shown side by side
document.querySelectorAll('.mailc').forEach(box => {
  const cols = [...box.querySelectorAll('.cmp-col')];
  const show = () => {
    const aud = box.dataset.aud;
    box.querySelectorAll('.cmp-aud button').forEach(b => b.setAttribute('aria-selected', b.dataset.aud === aud));
    cols.forEach(col => {
      const panes = [...col.querySelectorAll('.cmp-pane')];
      panes.forEach(p => { p.hidden = p.dataset.aud !== aud; });
      const p = panes.find(p => !p.hidden), st = col.querySelector('.cmp-stats'), has = !!p.dataset.opens;
      st.classList.toggle('no-data', !has);
      st.querySelector('.cs-opens').textContent = has ? p.dataset.opens : '—';
      st.querySelector('.cs-clicks').textContent = has ? p.dataset.clicks : '—';
      st.querySelector('.cs-words').textContent = p.dataset.words + ' words' + (has ? '' : ' · no data');
    });
  };
  box.querySelectorAll('.cmp-aud button').forEach(b => b.addEventListener('click', () => { box.dataset.aud = b.dataset.aud; show(); }));
  box.querySelectorAll('.cmp-pane').forEach(p => {
    const subj = p.querySelector('.mail-subject'); const opts = JSON.parse(subj.dataset.subjects);
    p.querySelectorAll('.ab button').forEach(btn => btn.addEventListener('click', () => {
      subj.textContent = opts[+btn.dataset.i];
      p.querySelectorAll('.ab button').forEach(b => b.setAttribute('aria-pressed', b === btn));
    }));
  });
  show();
});

// Edge drawings: size each side's drawing layer to the empty margin beside the main content column
(() => {
  const measure = () => {
    const W = innerWidth; let l = W, r = W;
    document.querySelectorAll('.h-hero .cols, .sectors, .work-head, .metrics, .channel, .contact-btns, .h-cloud').forEach(e => {
      const b = e.getBoundingClientRect(); if (b.width < 2) return;
      l = Math.min(l, b.left); r = Math.min(r, W - b.right);
    });
    const root = document.documentElement.style;
    // drawings sit in 92px columns (each needs ~80px); show only whole columns so none get cut off
    const fit = m => { const room = m - 14; if (room < 60) return 0; if (room < 172) return 60; return 92 * Math.floor((room - 80) / 92) + 80; };
    root.setProperty('--doodle-l', fit(l) + 'px');
    root.setProperty('--doodle-r', fit(r) + 'px');
  };
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(measure, 150); });
  addEventListener('load', measure); measure();
})();

// Expand previews: the three window dots work like a Mac window.
// Green = enlarge to fill the screen, red = close; Esc or clicking the backdrop also closes.
(() => {
  const frames = [...document.querySelectorAll('.browser, .mail-window')];
  if (!frames.length) return;
  const backdrop = document.createElement('div'); backdrop.className = 'xp-backdrop'; document.body.appendChild(backdrop);
  let open = null;
  const target = f => f.closest('.viewer') || f.closest('.mailc .cmp-cols') || f.closest('.mail') || f;
  const close = () => { if (!open) return; open.classList.remove('xp-open'); document.body.classList.remove('xp-lock'); backdrop.classList.remove('on'); open = null; };
  const expand = f => { close(); open = target(f); open.classList.add('xp-open'); document.body.classList.add('xp-lock'); backdrop.classList.add('on'); };
  frames.forEach(f => {
    const bar = f.querySelector(':scope > .bar, :scope > .mail-chrome'); if (!bar) return;
    const dots = bar.querySelectorAll('i');
    bar.classList.add('xp-bar');
    const hint = document.createElement('button'); hint.type = 'button'; hint.className = 'xp-hint'; hint.textContent = 'Expand ⤢';
    bar.appendChild(hint);
    const toggle = e => { e.stopPropagation(); open === target(f) ? close() : expand(f); };
    if (dots[2]) { dots[2].title = 'Expand'; dots[2].addEventListener('click', toggle); }
    if (dots[0]) { dots[0].title = 'Close'; dots[0].addEventListener('click', e => { e.stopPropagation(); close(); }); }
    if (dots[1]) dots[1].addEventListener('click', toggle);
    hint.addEventListener('click', toggle);
  });
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// Reach dot field: count up and fill dots once when scrolled into view (static if reduced motion)
(() => {
  const box = document.querySelector('.reach'); if (!box) return;
  const SEG = [
    { k: 'Facebook ads', v: 9618128, c: '#13385d' },
    { k: 'Google search ads', v: 572000, c: '#3b6fa3' },
    { k: 'LinkedIn ads', v: 80192, c: '#7fa6cc' },
    { k: 'Other campaigns', v: 4000000, c: '#b6c8dc' },
  ];
  const field = box.querySelector('.reach-field'), num = box.querySelector('.reach-count');
  const total = +num.dataset.total, display = +num.dataset.display;
  const dots = [];
  SEG.forEach(s => { for (let j = 0; j < Math.round(s.v / 10000); j++) { const d = document.createElement('i'); d.style.setProperty('--c', s.c); field.appendChild(d); dots.push(d); } });
  box.querySelector('.reach-legend').innerHTML = SEG.map(s => `<span><i style="background:${s.c}"></i>${s.k} · ${s.v >= 1e6 ? (s.v / 1e6).toFixed(1) + 'M' : Math.round(s.v / 1e3) + 'K'}</span>`).join('');
  const fmt = n => Math.round(n).toLocaleString('en-US');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  box.classList.add('armed'); num.textContent = '0';
  const play = () => {
    const dur = 2600, t0 = performance.now(); let shown = 0;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      num.textContent = fmt(total * e);
      for (const want = Math.floor(dots.length * e); shown < want; shown++) dots[shown].classList.add('on');
      if (p < 1) requestAnimationFrame(step);
      else { dots.forEach(d => d.classList.add('on')); num.textContent = fmt(display); setTimeout(() => box.classList.add('done'), 250); }
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.35 });
  io.observe(field);
})();
