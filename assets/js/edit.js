// Owner-only edit mode. Loaded by site.js ONLY when the URL contains ?edit.
// Anyone can type on their own copy of a web page; what makes this safe is SAVING:
// a save is a GitHub commit, which needs a token with write access to bry2501/portfolio.
// Visitors don't have one, so nothing they type ever leaves their browser.
(() => {
  const OWNER = 'bry2501', REPO = 'portfolio', FILE = location.pathname.split('/').pop() || 'index.html';
  const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
  const TOKEN_KEY = 'br-edit-token';
  const SEL = 'main p, main h1, main h2, main h3, main h4, main li, main figcaption, main cite, main .lbl, main .num, main .a-title, main .a-meta, main .mail-subject';
  const SKIP = '.kw-cloud, .reach-count, .reach-legend, .swipe-hint, .xp-hint, .viewer-live, .viewer-tabs, .mail-trio .ab, .lightbox, .trio-stats, .ct-n, script, style, [data-generated]';

  const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };
  const setToken = t => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {} };
  const gh = (path, opts = {}) => fetch(API + path, { ...opts, headers: { 'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + getToken(), ...(opts.headers || {}) } });
  const b64dec = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, '')), c => c.charCodeAt(0)));
  const b64enc = s => { const b = new TextEncoder().encode(s); let bin = ''; for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(bin); };
  const norm = s => s.replace(/\s+/g, ' ').trim();

  // ---------- UI ----------
  const css = document.createElement('style');
  css.textContent = `
  .ed-bar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;display:flex;gap:8px;align-items:center;background:#13385d;color:#fff;font:500 13px/1 Inter,system-ui,sans-serif;padding:8px 10px 8px 16px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.3);max-width:calc(100vw - 24px);flex-wrap:wrap}
  .ed-bar button{font:600 12px/1 Inter,system-ui,sans-serif;border:0;border-radius:999px;padding:8px 13px;cursor:pointer;background:#fff;color:#13385d}
  .ed-bar button.ghost{background:transparent;color:#cfe0f0;border:1px solid rgba(255,255,255,.3)}
  .ed-bar button:disabled{opacity:.45;cursor:default}
  .ed-msg{opacity:.85;margin-right:4px}
  body.ed-on [data-ed]{outline:1px dashed transparent;outline-offset:3px;border-radius:2px;transition:outline-color .15s}
  body.ed-on [data-ed]:hover{outline-color:#9a7b5f;cursor:text}
  body.ed-on [data-ed]:focus{outline:2px solid #c47f62;background:rgba(196,127,98,.06)}
  body.ed-on [data-ed].ed-changed{box-shadow:inset 3px 0 0 #c47f62}
  .ed-modal{position:fixed;inset:0;z-index:10000;background:rgba(10,20,35,.55);display:flex;align-items:center;justify-content:center;padding:16px}
  .ed-card{background:#fff;max-width:520px;width:100%;border-radius:12px;padding:22px 24px;font:15px/1.55 Inter,system-ui,sans-serif;color:#222}
  .ed-card h3{margin:0 0 8px;font:600 18px Inter,system-ui,sans-serif;color:#13385d}
  .ed-card ol{padding-left:20px;margin:8px 0 12px}.ed-card input{width:100%;font:14px ui-monospace,monospace;padding:10px;border:1px solid #ccd3dc;border-radius:8px;margin:6px 0 12px;box-sizing:border-box}
  .ed-card .row{display:flex;gap:8px;justify-content:flex-end}.ed-card button{font:600 13px Inter,system-ui,sans-serif;border-radius:999px;padding:9px 16px;border:1px solid #13385d;background:#13385d;color:#fff;cursor:pointer}
  .ed-card button.ghost{background:#fff;color:#13385d}.ed-err{color:#a9634a;font-size:13px;min-height:18px}`;
  document.head.appendChild(css);

  const bar = document.createElement('div'); bar.className = 'ed-bar'; bar.setAttribute('data-generated', '');
  bar.innerHTML = '<span class="ed-msg">Edit mode</span><button class="save" disabled>Save</button><button class="ghost discard" disabled>Discard</button><button class="ghost exit">Exit</button><button class="ghost forget" title="Remove the saved GitHub token from this browser">Sign out</button>';
  const msg = t => { bar.querySelector('.ed-msg').textContent = t; };

  function tokenDialog(err) {
    return new Promise(resolve => {
      const m = document.createElement('div'); m.className = 'ed-modal'; m.setAttribute('data-generated', '');
      m.innerHTML = `<div class="ed-card"><h3>Owner sign-in</h3>
        <p>Editing saves straight to your GitHub repository, so it needs a GitHub token that only you have.</p>
        <ol><li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub → Fine-grained tokens → Generate new token</a>.</li>
        <li>Repository access: <b>Only select repositories</b> → <b>${OWNER}/${REPO}</b>.</li>
        <li>Permissions → Repository → <b>Contents: Read and write</b>. Generate, then paste it here.</li></ol>
        <input type="password" placeholder="github_pat_…" autocomplete="off">
        <div class="ed-err">${err || ''}</div>
        <div class="row"><button class="ghost cancel">Cancel</button><button class="ok">Sign in</button></div></div>`;
      document.body.appendChild(m);
      const inp = m.querySelector('input'); inp.focus();
      const done = v => { m.remove(); resolve(v); };
      m.querySelector('.cancel').onclick = () => done('');
      m.querySelector('.ok').onclick = () => done(inp.value.trim());
      inp.onkeydown = e => { if (e.key === 'Enter') done(inp.value.trim()); };
    });
  }

  // ---------- auth: only someone whose token can PUSH to the repo gets edit mode ----------
  let branch = null, srcSha = null, srcText = null;
  async function signIn(err) {
    let t = getToken();
    if (!t) { t = await tokenDialog(err); if (!t) return false; setToken(t); }
    const r = await gh('');
    if (!r.ok) { setToken(''); return signIn('That token was rejected by GitHub. Check it and try again.'); }
    const repo = await r.json();
    if (!repo.permissions || !repo.permissions.push) { setToken(''); return signIn('That token can read but not write to the repository. Give it Contents: Read and write.'); }
    // the branch GitHub Pages publishes from (falls back to the default branch)
    branch = repo.default_branch;
    try { const p = await gh('/pages'); if (p.ok) { const j = await p.json(); if (j.source && j.source.branch) branch = j.source.branch; } } catch {}
    return true;
  }

  async function loadSource() {
    const r = await gh(`/contents/${FILE}?ref=${encodeURIComponent(branch)}&t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) throw new Error('Could not read ' + FILE + ' from GitHub (' + r.status + ').');
    const j = await r.json(); srcSha = j.sha; srcText = b64dec(j.content);
  }

  // ---------- map live elements to the same elements in the source file ----------
  const pick = root => [...root.querySelectorAll(SEL)].filter(el => !el.closest(SKIP) && !el.querySelector(SEL) && norm(el.textContent).length);
  let live = [], orig = new Map();

  function enable() {
    live = pick(document);
    live.forEach((el, i) => {
      el.setAttribute('data-ed', i); el.contentEditable = 'true'; el.spellcheck = true;
      orig.set(el, el.innerHTML);
      el.addEventListener('input', update);
    });
    document.body.classList.add('ed-on');
    // links/zoom shouldn't fire while editing text
    document.addEventListener('click', e => { if (e.target.closest('[data-ed]') && e.target.closest('a, img.zoom')) e.preventDefault(); }, true);
    // paste as plain text only (no stray formatting)
    document.addEventListener('paste', e => { if (!e.target.closest || !e.target.closest('[data-ed]')) return; e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });
  }
  const changed = () => live.filter(el => el.innerHTML !== orig.get(el));
  function update() {
    const c = changed();
    live.forEach(el => el.classList.toggle('ed-changed', c.includes(el)));
    bar.querySelector('.save').disabled = !c.length; bar.querySelector('.discard').disabled = !c.length;
    msg(c.length ? `${c.length} unsaved change${c.length > 1 ? 's' : ''}` : 'Edit mode · click any text');
  }
  const clean = html => html.replace(/\s(contenteditable|spellcheck|data-ed)="[^"]*"/g, '').replace(/<br>$/, '');

  async function save() {
    const c = changed(); if (!c.length) return;
    msg('Saving…'); bar.querySelector('.save').disabled = true;
    try {
      await loadSource(); // latest version, so we never overwrite someone else's commit
      const doc = new DOMParser().parseFromString(srcText, 'text/html');
      const src = pick(doc);
      let text = srcText, failed = [];
      for (const el of c) {
        const i = +el.getAttribute('data-ed'), s = src[i];
        if (!s || norm(s.textContent) !== norm(new DOMParser().parseFromString('<p>' + orig.get(el) + '</p>', 'text/html').body.textContent)) { failed.push(el); continue; }
        const before = s.innerHTML, after = clean(el.innerHTML);
        const at = text.indexOf(before);
        if (at < 0 || text.indexOf(before, at + 1) >= 0) { failed.push(el); continue; }
        text = text.slice(0, at) + after + text.slice(at + before.length);
      }
      if (failed.length) { failed.forEach(el => el.style.boxShadow = 'inset 3px 0 0 #b3261e'); msg(`${failed.length} change(s) couldn't be matched to the file — reload and redo them`); if (failed.length === c.length) { update(); return; } }
      const r = await gh(`/contents/${FILE}`, { method: 'PUT', body: JSON.stringify({ message: `Edit text on the site (${c.length - failed.length} change${c.length - failed.length > 1 ? 's' : ''})`, content: b64enc(text), sha: srcSha, branch }) });
      if (r.status === 409) { msg('The file changed on GitHub since this page loaded — reload, then redo your edits'); return; }
      if (!r.ok) { msg('Save failed (' + r.status + ')'); update(); return; }
      c.filter(el => !failed.includes(el)).forEach(el => orig.set(el, el.innerHTML));
      update(); msg('Saved ✓ — live in about a minute');
    } catch (e) { msg(e.message || 'Save failed'); update(); }
  }

  bar.querySelector('.save').onclick = save;
  bar.querySelector('.discard').onclick = () => { changed().forEach(el => el.innerHTML = orig.get(el)); update(); };
  bar.querySelector('.exit').onclick = () => { if (changed().length && !confirm('Leave without saving your changes?')) return; location.href = location.pathname + location.hash; };
  bar.querySelector('.forget').onclick = () => { setToken(''); location.href = location.pathname + location.hash; };
  addEventListener('beforeunload', e => { if (changed().length) { e.preventDefault(); e.returnValue = ''; } });

  (async () => {
    if (!(await signIn())) { location.href = location.pathname + location.hash; return; }
    document.body.appendChild(bar);
    try { await loadSource(); } catch (e) { msg(e.message); return; }
    enable(); update();
  })();
})();
