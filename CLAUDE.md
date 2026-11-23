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
