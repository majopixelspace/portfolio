# María José Barrón — Portfolio

A narrative portfolio deck (HTML / CSS / JS, no build step) — the story of a software
engineer turned product designer who prototypes in code with AI.

## Run locally

Just open `index.html` in a browser, or serve it:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

- `index.html` — the deck (8 full-screen sections; keyboard + scroll navigation)
- `styles.css` — design tokens + styles
- `deck.js` — navigation + the interactive "Inside the system" exhibit
- `auri-case-study.html`, `cirrus-meeting-ai-case-study.html` — full case studies
- `images/web/` — web-optimized images used by the deck

## Deploy to Render (static site)

1. **New → Static Site**, connect this repository
2. **Build Command:** _(leave empty)_
3. **Publish Directory:** `.`
4. **Create** — done.

Or use the included `render.yaml` via **New → Blueprint**.
