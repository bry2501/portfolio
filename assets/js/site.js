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
  const close = () => { if (!open) return; document.querySelectorAll('.xp-host').forEach(h => h.classList.remove('xp-host')); open.classList.remove('xp-open'); document.body.classList.remove('xp-lock'); backdrop.classList.remove('on'); open = null; };
  const expand = f => { close(); open = target(f); const sr = open.closest('.slide-ready'); if (sr) sr.classList.add('slide-in'); open.classList.add('xp-open'); const host = open.closest('main > *'); if (host) host.classList.add('xp-host'); document.body.classList.add('xp-lock'); backdrop.classList.add('on'); };
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
  box.querySelector('.reach-legend').innerHTML = SEG.map(s => `<span><i style="background:${s.c}"></i>${s.k} · ${s.v >= 1e6 ? (s.v / 1e6).toFixed(1) + 'M' : Math.round(s.v / 1e3) + 'K'}</span>`).join('');
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const colors = []; SEG.forEach(s => { for (let j = 0; j < Math.round(s.v / 10000); j++) colors.push(s.c); });
  const N = colors.length;
  const cv = document.createElement('canvas'), ctx = cv.getContext && cv.getContext('2d');
  if (!ctx) return; // no canvas: leave the field empty (legend + number still show)
  field.appendChild(cv);
  const mq = matchMedia('(max-width: 820px)');
  let geo = null, prog = 1; // prog: 0..1 animation progress (1 = all dots full)
  const layout = () => {
    const cols = mq.matches ? 40 : 60, gap = mq.matches ? 2 : 4;
    const w = field.clientWidth || 720, d = (w - gap * (cols - 1)) / cols, rows = Math.ceil(N / cols);
    const h = rows * d + (rows - 1) * gap, dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    geo = { cols, gap, d };
  };
  const GROW = 0.12; // each dot grows over this share of the timeline (~350ms of ~2.9s)
  const draw = () => {
    const { cols, gap, d } = geo; ctx.clearRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < N; i++) {
      const start = (i / N) * (1 - GROW), k = prog >= 1 ? 1 : Math.max(0, Math.min(1, (prog - start) / GROW));
      if (k <= 0) continue;
      const r = (d / 2) * (0.2 + 0.8 * (1 - Math.pow(1 - k, 2)));
      ctx.globalAlpha = Math.min(1, k * 2);
      ctx.fillStyle = colors[i];
      ctx.beginPath(); ctx.arc((i % cols) * (d + gap) + d / 2, Math.floor(i / cols) * (d + gap) + d / 2, r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  layout(); draw();
  let rz; addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { layout(); draw(); }); });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  box.classList.add('armed'); num.textContent = '0'; prog = 0; draw();
  const play = () => {
    const dur = 2900; let t0 = null;
    const ease = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // ease-in-out: even fill, no burst
    const step = t => {
      if (t0 === null) t0 = t; // start the clock on the first real frame
      const p = Math.min(1, (t - t0) / dur);
      prog = p; draw();
      num.textContent = fmt(total * ease(p));
      if (p < 1) requestAnimationFrame(step);
      else { prog = 1; draw(); num.textContent = fmt(display); setTimeout(() => box.classList.add('done'), 250); }
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.35 });
  io.observe(field);
})();

// Mobile helpers (only visible ≤820px via mobile.css): swipe rows + Andrews previous/rewrite toggle
(() => {
  // social rows: images are wrapped into a swipe strip only on mobile (desktop grid needs them as direct children)
  const rows = [...document.querySelectorAll('.social-row')].map(row => ({ row, imgs: [...row.querySelectorAll(':scope > img')] })).filter(r => r.imgs.length > 1);
  rows.forEach(r => { r.strip = document.createElement('div'); r.strip.className = 'swipe-m social-swipe'; });
  const wrapRows = on => rows.forEach(r => {
    if (on && !r.strip.isConnected) { r.imgs[0].before(r.strip); r.imgs.forEach(i => r.strip.appendChild(i)); }
    if (!on && r.strip.isConnected) { r.imgs.forEach(i => r.strip.before(i)); r.strip.remove(); }
  });
  document.querySelectorAll('.shots, .articles').forEach(g => g.classList.add('swipe-m'));
  document.querySelectorAll('.mail-trio, .tm-grid').forEach(g => { const h = document.createElement('p'); h.className = 'swipe-hint swipe-hint-fixed'; h.textContent = 'Swipe to see more →'; g.after(h); });
  const hint = g => { if (g.nextElementSibling?.classList.contains('swipe-hint')) return; const h = document.createElement('p'); h.className = 'swipe-hint'; h.style.display = 'none'; h.textContent = 'Swipe to see more →'; g.after(h); };
  const mq = matchMedia('(max-width: 820px)');
  const sync = () => {
    wrapRows(mq.matches);
    document.querySelectorAll('.swipe-m').forEach(g => { const on = mq.matches && g.children.length > 1; g.classList.toggle('swipe', on); if (on) hint(g); });
  };
  mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync); sync();
  document.querySelectorAll('.cmp-cols').forEach(cols => {
    cols.dataset.show = 'new';
    const pick = document.createElement('div'); pick.className = 'cmp-ver cmp-pick'; pick.style.display = 'none';
    pick.innerHTML = '<button aria-pressed="false" data-v="old">Previous version</button><button aria-pressed="true" data-v="new">My rewrite</button>';
    pick.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cols.dataset.show = b.dataset.v; pick.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    cols.before(pick);
  });
})();

// Kettering monthly applications: draw the line when it scrolls into view (static for reduced motion)
(() => {
  const box = document.querySelector('.kviz'); if (!box || !box.querySelector('.kline')) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  box.classList.add('kl-armed');
  const io = new IntersectionObserver(es => {
    if (!es.some(e => e.isIntersecting)) return; io.disconnect();
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('kl-play')));
  }, { threshold: 0.4 });
  io.observe(box.querySelector('.kline'));
})();

// Skills word cloud: words pop in (biggest first) when the summary scrolls into view; static for reduced motion
(() => {
  const box = document.querySelector('.sum-skills'); if (!box) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const words = [...box.querySelectorAll('.kw-cloud span')];
  const tier = w => +((w.className.match(/t(\d)/) || [0, 1])[1]);
  const dist = w => Math.hypot(parseFloat(w.style.left) - 50, parseFloat(w.style.top) - 50);
  words.slice().sort((a, b) => tier(b) - tier(a) || dist(a) - dist(b))
    .forEach((w, i, all) => w.style.setProperty('--d', (i * 2.2 / all.length).toFixed(2) + 's'));
  box.classList.add('kw-armed');
  const io = new IntersectionObserver(es => {
    if (!es.some(e => e.isIntersecting)) return; io.disconnect();
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('kw-play')));
  }, { threshold: 0.35 });
  io.observe(box);
})();

// Owner edit mode: only loaded when the address has ?edit. Saving requires the owner's GitHub token.
if (/[?&]edit\b/.test(location.search)) { const s = document.createElement('script'); s.src = 'assets/js/edit.js?v=2'; document.body.appendChild(s); }

// Section snapping: tell CSS the real header and quote-band heights so "full-screen" sections fit exactly
(() => {
  const set = () => {
    const r = document.documentElement.style, h = document.querySelector('.site-header'), q1 = document.querySelector('.h-quote1'), q2 = document.querySelector('.h-quote2');
    if (h) r.setProperty('--hdr', h.offsetHeight + 'px');
    if (q1) r.setProperty('--q1', q1.offsetHeight + 'px');
    if (q2) r.setProperty('--q2', q2.offsetHeight + 'px');
  };
  set(); addEventListener('resize', set); addEventListener('load', set);
})();

// Slide-in: each snapped section's content eases up as it arrives (desktop, no reduced motion; content stays visible without JS)
(() => {
  if (!matchMedia('(min-width: 821px) and (prefers-reduced-motion: no-preference)').matches || !('IntersectionObserver' in window) || /[?&]edit\b/.test(location.search)) return;
  const secs = [...document.querySelectorAll('.h-overview, main > section.work')];
  const reveal = el => { const go = () => el.classList.add('slide-in'); go(); };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }), { threshold: 0.12 });
  secs.forEach(s => { const r = s.getBoundingClientRect(); if (r.top < innerHeight * .9) return; s.classList.add('slide-ready'); io.observe(s); });
})();

// Stronger snap: when scrolling stops near a section start (within ~40% of the window), glide it into place under the header.
// Long sections are never trapped: mid-section (no start nearby) nothing happens. Desktop, no reduced motion, not in edit mode.
(() => {
  return; // superseded by slideshow scrolling below
  if (!matchMedia('(min-width: 821px) and (prefers-reduced-motion: no-preference)').matches || /[?&]edit\b/.test(location.search)) return;
  const pts = () => {
    const hdr = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 66;
    const list = [0, ...[...document.querySelectorAll('.h-overview, main > section.work, .snap-pt')].map(s => s.getBoundingClientRect().top + scrollY - hdr)];
    list.push(document.documentElement.scrollHeight - innerHeight); // bottom of page
    return list;
  };
  let t = 0, settling = false, lastY = scrollY, down = false, dir = 0;
  addEventListener('mousedown', () => { down = true; }); addEventListener('mouseup', () => { down = false; });
  addEventListener('scroll', () => {
    if (settling) return;
    const nd = Math.sign(scrollY - lastY); if (nd) dir = nd; lastY = scrollY;
    clearTimeout(t);
    t = setTimeout(() => {
      if (down || document.querySelector('.xp-open, .lightbox.open')) return;
      const y = scrollY, range = innerHeight * 0.4;
      let best = null, bd = Infinity;
      for (const p of pts()) {
        const d = Math.abs(p - y);
        const ahead = dir > 0 ? p > y : dir < 0 ? p < y : true; // follow the scroll direction; never yank backwards
        if (d > 2 && d < bd && ((ahead && d < range) || d < 60)) { best = p; bd = d; }
      }
      if (best == null) return;
      settling = true; scrollTo({ top: best, behavior: 'smooth' });
      setTimeout(() => { settling = false; lastY = scrollY; }, 650);
    }, 150);
  }, { passive: true });
})();

// Slideshow scrolling (desktop, no reduced motion, not edit mode): one wheel/trackpad gesture or key press = next/previous slide.
// If the current slide is taller than the window, scroll through it normally until its end, then the next gesture advances.
(() => {
  if (!matchMedia('(min-width: 821px) and (prefers-reduced-motion: no-preference)').matches || /[?&]edit\b/.test(location.search)) return;
  const hdr = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 66;
  const pts = () => {
    const h = hdr(), maxY = document.documentElement.scrollHeight - innerHeight;
    const list = [0, ...[...document.querySelectorAll('.h-overview, main > section.work, .snap-pt')].map(s => Math.round(s.getBoundingClientRect().top + scrollY - h)), maxY];
    return [...new Set(list.map(v => Math.max(0, Math.min(maxY, v))))].sort((a, b) => a - b);
  };
  let anim = false, quietUntil = 0, lastWheel = 0;
  const ease = t => 1 - Math.pow(1 - t, 3);
  function glide(to) {
    const from = scrollY, d = to - from, dur = Math.min(900, 450 + Math.abs(d) * 0.25); let t0 = null;
    anim = true; window.__gliding = true; document.documentElement.style.scrollBehavior = 'auto';
    // reveal the slide we're heading to right away, so it fades in as it arrives
    const h0 = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 66;
    document.querySelectorAll('.slide-ready:not(.slide-in)').forEach(el => { const t = el.getBoundingClientRect().top + scrollY - h0; const b = t + el.offsetHeight; if (b > to + 10 && t < to + innerHeight) el.classList.add('slide-in'); });
    const step = now => { if (t0 === null) t0 = now; const p = Math.min(1, (now - t0) / dur); scrollTo(0, from + d * ease(p)); if (p < 1) requestAnimationFrame(step); else { anim = false; window.__gliding = false; quietUntil = performance.now() + 450; } };
    requestAnimationFrame(step);
  }
  // decide: glide to the next/prev slide, or let the page scroll natively inside a tall slide
  function move(dir, amount) {
    const y = scrollY, view = innerHeight - hdr(), P = pts();
    if (dir > 0) {
      const next = P.find(p => p > y + 2); if (next == null) return false;
      if (next - y <= view + 2) { glide(next); return true; }          // end of this slide is on screen → next slide
      if (y + amount > next - view) { glide(next - view); return true; } // don't overshoot the end of a tall slide
      return false;                                                       // inside a tall slide → normal scroll
    } else {
      const prev = [...P].reverse().find(p => p < y - 2); if (prev == null) return false;
      if (y - prev <= view + 2) { glide(prev); return true; }
      return false;
    }
  }
  addEventListener('wheel', e => {
    if (e.ctrlKey || document.querySelector('.xp-open, .lightbox.open')) return;
    // let inner scrollers (website previews, email windows) scroll themselves
    const inner = e.target.closest && e.target.closest('.scroll, .mail-pane, .tm-grid, .mail-trio');
    if (inner && inner.scrollHeight > inner.clientHeight + 2) {
      const atTop = inner.scrollTop <= 0, atEnd = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;
      if (!((e.deltaY > 0 && atEnd) || (e.deltaY < 0 && atTop))) return;
    }
    const now = performance.now(), gap = now - lastWheel; lastWheel = now;
    if (anim || now < quietUntil) { e.preventDefault(); return; }          // swallow momentum during/after a glide
    if (Math.abs(e.deltaY) < 2) return;
    if (move(Math.sign(e.deltaY), Math.abs(e.deltaY))) e.preventDefault();
    else if (gap < 60 && anim) e.preventDefault();
  }, { passive: false });
  addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input, textarea, [contenteditable="true"]')) return;
    const k = e.key, dir = (k === 'PageDown' || k === 'ArrowDown' || (k === ' ' && !e.shiftKey)) ? 1 : (k === 'PageUp' || k === 'ArrowUp' || (k === ' ' && e.shiftKey)) ? -1 : 0;
    if (!dir) return;
    if (anim) { e.preventDefault(); return; }
    if (move(dir, k.startsWith('Arrow') ? 60 : innerHeight * 0.85)) e.preventDefault();
  });
})();

// Drop caps only on paragraphs long enough to wrap around them
document.querySelectorAll('.proj-story').forEach(s => { const p = s.querySelector('p'); if (p && p.textContent.trim().length < 260) s.classList.add('no-drop'); });
