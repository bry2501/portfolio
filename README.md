# Bryan Rivera — Portfolio

Copywriting portfolio site (migrated from riverabry.wordpress.com). Plain HTML/CSS/JS, no build step — hosted free on GitHub Pages.

## Pages
| File | Page |
|---|---|
| `index.html` | Home: about, clients, services overview |
| `landing-pages.html` | Landing page case studies |
| `social-media.html` | Social media work |
| `email.html` | Email marketing |

Assets: `assets/css/style.css` (shared styling + header), `assets/css/home.css` (home page), `assets/js/site.js` (mobile menu, image zoom), `assets/img/`, `assets/docs/` (résumé).

## Publish with GitHub Pages
Repo **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`. The site appears at `https://bry2501.github.io/portfolio/`.

## Preview locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.
