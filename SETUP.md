# INVENEW — Setup Checklist

## Assets to add

Place these files in `assets/img/`:

| File | Description |
|------|-------------|
| `logo-light.png` | Logo for light mode (from your existing Vercel site) |
| `logo-dark.png`  | Logo for dark mode (from your existing Vercel site) |
| `founder.jpg`    | Your headshot for the About page (square crop, min 200×200px) |

## Configuration

### 1. Beehiiv (newsletter.html + assets/js/newsletter.js)

In `newsletter.html`, update the iframe src:
```
src="https://embeds.beehiiv.com/YOUR_PUBLICATION_ID"
```

In `assets/js/newsletter.js`, update:
```js
var BEEHIIV_PUBLICATION_ID = 'YOUR_PUBLICATION_ID';
var BEEHIIV_BASE_URL       = 'https://invenew.beehiiv.com';
```
Find your publication ID: Beehiiv → Settings → Publication → Embed.

---

### 2. Sanity CMS (assets/js/blog.js)

```js
var SANITY_PROJECT_ID = 'YOUR_PROJECT_ID';
var SANITY_DATASET    = 'production';
```
Find your project ID: sanity.io/manage → your project → Settings → API.

Note: The GROQ query assumes posts have `title`, `slug`, `excerpt`, `publishedAt`, and `categories`. Adjust if your schema differs.

---

### 3. Sponsor inquiry form (assets/js/sponsors.js)

```js
var FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
```
Sign up at formspree.io → create a form → copy the endpoint.
Alternative: Netlify Forms, or any backend endpoint accepting JSON POST.

---

### 4. About page (about.html)

Replace:
- `[Your Name]` — your actual name (appears in `<h3>` tag)
- `[Your Title]` — e.g. "Founder, INVENEW"
- The three placeholder paragraphs — rewrite in your own voice

---

### 5. LinkedIn URL (assets/js/components.js)

Update the LinkedIn href in the footer:
```js
<a href="https://linkedin.com/in/yourprofile" ...>LinkedIn</a>
```

---

### 6. Legal pages

In `privacy.html` and `legal.html`:
- Replace `[Registered address]` with your actual registered address
- Update the jurisdiction in `legal.html`

---

## Deploying to Vercel

This is a static site. To deploy:

1. Push the `invenew/` folder to a GitHub repo.
2. Import the repo into Vercel (vercel.com/new).
3. No build step needed — it's plain HTML/CSS/JS.
4. Set your custom domain in Vercel → Settings → Domains.

---

## File structure

```
invenew/
├── index.html          Homepage
├── intelligence.html   Intelligence page
├── labs.html           Labs page
├── newsletter.html     Newsletter + Beehiiv embed
├── blog.html           Blog + Sanity CMS loader
├── sponsors.html       Partner / sponsorship page
├── about.html          About + founder section
├── privacy.html        Privacy policy
├── legal.html          Terms & legal
└── assets/
    ├── css/
    │   └── style.css       Global styles + dark/light mode
    ├── js/
    │   ├── main.js         Theme toggle, mobile nav, shared utils
    │   ├── components.js   Nav & footer (injected on all pages)
    │   ├── newsletter.js   Beehiiv recent issues loader
    │   ├── blog.js         Sanity CMS post loader
    │   └── sponsors.js     Partner inquiry form handler
    └── img/
        ├── logo-light.png  (add this)
        ├── logo-dark.png   (add this)
        └── founder.jpg     (add this)
```
