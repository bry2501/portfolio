# Bryan Rivera — Portfolio

Copywriting portfolio site (migrated from riverabry.wordpress.com). Plain HTML/CSS/JS, no build step — hosted free on GitHub Pages.

## Structure
Single-page site: everything lives in `index.html`. The header links jump to sections on the page:

| Section id | Content |
|---|---|
| `#top` | Hero / About Me, quote, word cloud, Overview (clients), services summary |
| `#social-media` | Social media work |
| `#landing-pages` | Landing page case studies |
| `#email` | Email samples |
| `#contact` | Contact buttons (email, LinkedIn, résumé PDF) |

**Placeholders:** text still to be written is marked with the `ph` class (dashed outline + "PLACEHOLDER" tag). Open the browser console to see the full list.

Assets: `assets/css/style.css` (shared styling + header), `assets/css/home.css` (home page), `assets/js/site.js` (mobile menu, image zoom), `assets/img/`, `assets/docs/` (résumé).

## Publish with GitHub Pages
Repo **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`. The site appears at `https://bry2501.github.io/portfolio/`.

## Preview locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.
