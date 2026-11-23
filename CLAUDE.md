# Portfolio site — notes for Claude

- Static site, no build step. Every page is a standalone `.html` file at the repo root.
- The header nav, contact CTA and footer are duplicated in every page. When adding/renaming a page or changing contact links, update ALL `.html` files (and the nav table in README.md).
- Styling lives only in `assets/css/style.css`; design tokens (colors, fonts, widths) are CSS variables in `:root`. Prefer reusing existing classes (`section`, `.container`, `.service`, `.case`, `.gallery`, `.quote`, `.shot`, `.browser`, `.tags`, `.btn`) over inline styles.
- Images go in `assets/img/` as optimized `.webp` (≤1400px wide). Give every image real `alt` text. Add `class="zoom"` to make an image open full-size on click.
- Résumé file: `assets/docs/bryan-rivera-resume.docx` (linked from every page's CTA and the home hero).
- Must stay readable on phones (check at ~375px width).
- Owner's links: LinkedIn https://www.linkedin.com/in/bry-rivera
- The home page (`index.html` + `assets/css/home.css`) is a faithful copy of the original WordPress (Twenty Twenty-Four) home page: Cardo headings, Inter body, Newsreader header/nav, Albert Sans "About Me" text, navy #13385d, base #f9f9f9, overview band #dfeaf7. Keep it matching unless the owner asks for design changes.
- Current focus is the desktop browser experience; mobile layout is deferred until the owner asks.
- CSS/JS links carry a `?v=N` cache-busting query. Bump N in every `.html` file whenever you change a stylesheet or script, so browsers don't pair new HTML with stale CSS.
- No blog: the site intentionally has no blog/posts section. Don't add one unless the owner asks.
