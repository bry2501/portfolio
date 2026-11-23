# Portfolio site — notes for Claude

- Static site, no build step. It is a SINGLE PAGE: all content is in `index.html`, and the header nav links are in-page anchors (`#social-media`, `#landing-pages`, `#email`). To add a section, add a `<section class="work" id="...">` in `index.html` and a matching nav link; `site.js` highlights the active link automatically.
- Home/section styles live in `assets/css/home.css`; `assets/css/style.css` holds base styles and the header.
- Prefer the existing section classes in `home.css` (`.work`, `.work-head`, `.social-row`, `.lp`, `.email-grid`, `.svc`, `.h-band`) over inline styles. Beware: `style.css` still has generic classes like `.client`, `section` and `.quote`; use distinct names to avoid collisions.
- Images go in `assets/img/` as optimized `.webp` (≤1400px wide). Give every image real `alt` text. Add `class="zoom"` to make an image open full-size on click.
- Résumé file: `assets/docs/bryan-rivera-resume.docx` (linked from the Resume button in the hero).
- Owner's links: LinkedIn https://www.linkedin.com/in/bry-rivera
- The home page (`index.html` + `assets/css/home.css`) is a faithful copy of the original WordPress (Twenty Twenty-Four) home page: Cardo headings, Inter body, Newsreader header/nav, Albert Sans "About Me" text, navy #13385d, base #f9f9f9, overview band #dfeaf7. Keep it matching unless the owner asks for design changes.
- Current focus is the desktop browser experience; mobile layout is deferred until the owner asks.
- CSS/JS links carry a `?v=N` cache-busting query. Bump N in every `.html` file whenever you change a stylesheet or script, so browsers don't pair new HTML with stale CSS.
- No blog: the site intentionally has no blog/posts section. Don't add one unless the owner asks.
- Profile photo: `assets/img/profile.webp` (circular crop with transparent corners, shown above the name in the hero).
- **Bryan writes all copy.** Claude builds structure and functionality only. Never invent copy, metrics, client facts or URLs. Where text is needed, add a placeholder: `<span class="ph" data-ph="hint for Bryan">[Label]</span>` (styled in `home.css`, listed in the browser console by `site.js`). When Bryan supplies the text, replace it and remove the `ph` class and `data-ph`. The email button uses `.ph-link` until a real address is set.
- Reusable components in `home.css`: `.cs-facts` (case-study `<dl>`: Client/Goal/Audience/What I did/Result), `.metrics` > `.metric` (number + label tiles), `.see-more` (service → section link), `.contact-btns`.
- Résumé: the PDF (`assets/docs/bryan-rivera-resume.pdf`) is the primary link; the `.docx` is a secondary download. When the résumé changes, regenerate the PDF with `soffice --headless --convert-to pdf`.
- Layout balance rules: every section's content uses the same max width (1280px inside the side padding) so edges align; centered elements sit on the page axis; paired cards (e.g. emails) stretch to equal height. Keep these when adding sections.
- **Results first:** every project opens with `<p class="result-lead">` (headline result), and each work section has a `.metrics.metrics-top` strip right under its heading. The Result row was intentionally removed from `.cs-facts` to avoid repeating it.
- **Process panels:** every project has a `<details class="process">` "How I got there" timeline (Brief → Insight → Directions explored → Final → Why it worked). It's native `<details>`, so no JS. Add one to any new project.
