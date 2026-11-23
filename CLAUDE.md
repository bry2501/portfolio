# Portfolio site — notes for Claude

- Static site, no build step. Every page is a standalone `.html` file at the repo root.
- The header nav, contact CTA and footer are duplicated in every page. When adding/renaming a page or changing contact links, update ALL `.html` files (and the nav table in README.md).
- Styling lives only in `assets/css/style.css`; design tokens (colors, fonts, widths) are CSS variables in `:root`. Prefer reusing existing classes (`section`, `.container`, `.service`, `.case`, `.gallery`, `.quote`, `.shot`, `.browser`, `.tags`, `.btn`) over inline styles.
- Images go in `assets/img/` as optimized `.jpg` (≤1400px wide). Give every image real `alt` text. Add `class="zoom"` to make an image open full-size on click.
- Résumé file: `assets/docs/bryan-rivera-resume.docx` (linked from every page's CTA and the home hero).
- Must stay readable on phones (check at ~375px width).
- Owner's links: LinkedIn https://www.linkedin.com/in/bry-rivera
