# Bryan Rivera — Portfolio

Copywriting portfolio site (migrated from riverabry.wordpress.com). Plain HTML/CSS/JS, no build step — hosted free on GitHub Pages.

## Structure
Single-page site organized by client. The Overview pills (`#clients`) jump to each client section: Kettering Health, Adairsville SDA, Creation Sabbath, Luminate App, ChipsAway USA, Where 2 Network, Andrews University, A Better Florida, Publications. Each section groups that client's work by channel. `#contact` is at the end.

**Filling in placeholders:** in `index.html`, search for `placeholder`. Each hit looks like `data-copy="placeholder for Kettering Health social media: Goal"`. Replace the words between the quotes with your text, e.g. `data-copy="Recruit returning RNs"`, and commit. The highlight disappears automatically. The page shows each placeholder's exact text, so you can copy it from the page into the search box. If your text needs a double quote, use curly quotes (“ ”). Your email: search `placeholder for your email address` and put your address between the quotes.

Assets: `assets/css/style.css` (shared styling + header), `assets/css/home.css` (home page), `assets/js/site.js` (mobile menu, image zoom), `assets/img/`, `assets/docs/` (résumé).

## Publish with GitHub Pages
Repo **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`. The site appears at `https://bry2501.github.io/portfolio/`.

## Preview locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.
