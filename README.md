# Gifted Hands Creations

Static, informational/portfolio site for **Gifted Hands Creations** — a veteran-owned, handmade woodcraft shop (American flag art, wooden heart décor, custom engraved keepsakes). Built with [Eleventy (11ty)](https://www.11ty.dev/), plain CSS, and no backend.

This is **not** a storefront — there's no cart, checkout, or pricing. It's a fast, free-to-host home for the brand's story and gallery, with a way for people to reach out.

## Tech stack

- **Eleventy (11ty)** — static site generator, output to `_site/`
- **Plain CSS** with custom properties — mobile-first, no framework
- Content lives in **Markdown pages** (`src/*.md`) and **JSON data** (`src/_data/`), so it's easy to hand-edit or later wire up a headless CMS (e.g. Decap CMS)
- **Cloudflare Pages** for free hosting + automatic deploys from GitHub

## Local development

```bash
npm install
npm start        # serves the site at http://localhost:8080 with live reload
npm run build     # builds the production site into _site/
```

## Project structure

```
src/
├── _includes/
│   ├── layouts/base.njk       # shared HTML shell (head, header, footer)
│   └── partials/               # header.njk, footer.njk
├── _data/
│   ├── site.json               # site name, tagline, email, social links, trust badges
│   └── portfolio.json          # the 3 gallery collections + their images
├── assets/
│   ├── css/style.css
│   ├── js/nav.js                # mobile nav toggle
│   └── images/                  # placeholder SVGs — swap for real photos
├── index.md                     # Home
├── gallery/
│   ├── index.md                 # Gallery landing (lists all 3 collections)
│   ├── stars-and-stripes.md
│   ├── from-the-heart.md
│   └── crafted-keepsakes.md
├── about.md
├── contact.md
├── sitemap.njk                  # generates /sitemap.xml at build
└── robots.txt.njk               # generates /robots.txt at build
```

## Editing content

- **Site-wide info** (name, tagline, email, social links, trust badges): `src/_data/site.json`
- **Gallery collections & images**: `src/_data/portfolio.json`. Each collection has a `slug`, `title`, descriptions, and an `images` array (`src` + `alt` text). The three gallery pages under `src/gallery/` pull from this file by matching `slug` — you don't need to touch the page templates to add/reorder photos, just edit the JSON.
- **Page copy** (Home intro, About story, Contact blurb): edit the Markdown/HTML directly in `src/index.md`, `src/about.md`, `src/contact.md`.
- **Per-page SEO**: each page's front matter (`title`, `description`) drives the `<title>` and meta/Open Graph tags in `src/_includes/layouts/base.njk`.

### Swapping in real photos

All images are currently placeholder SVGs (`src/assets/images/*.svg`) so the site builds and reads correctly with no real photos yet. To swap them in:

1. Export real photos as **WebP** (with a JPEG fallback if you want maximum browser support) and drop them in `src/assets/images/`.
2. Update the `src`/`alt` fields in `src/_data/portfolio.json` and the `<img>` tags in `src/index.md` / `about.md` to point at the new files.
3. Keep `loading="lazy"` on below-the-fold images (already set on gallery/card images) and `loading="eager"` only on the hero image.
4. For the WebP-with-fallback pattern, use `<picture>`:
   ```html
   <picture>
     <source srcset="/assets/images/flag-01.webp" type="image/webp">
     <img src="/assets/images/flag-01.jpg" alt="..." loading="lazy" width="800" height="600">
   </picture>
   ```

### Contact form

The contact form (`src/contact.md`) currently posts to a placeholder [Formspree](https://formspree.io) endpoint (`YOUR_FORM_ID`) with a `mailto:` fallback link right below it. To make it live:

- **Option A — Formspree (simplest):** create a free Formspree form and replace `YOUR_FORM_ID` in the form's `action` attribute.
- **Option B — Cloudflare Pages Functions:** once ready to go serverless-free-tier, add a `functions/contact.js` file at the repo root (outside `src/`) implementing a `POST` handler — Cloudflare Pages automatically deploys anything in `/functions` alongside the static build. This wasn't set up yet since it adds moving parts (email delivery, spam handling) beyond what's needed for a first launch; a `wrangler.toml` isn't required for the Git-integration deploy flow described below, only if you add Pages Functions with more advanced bindings later.

## Deployment (GitHub + Cloudflare Pages)

1. Push this repo to GitHub.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, select this repo.
3. Build settings:
   - Framework preset: **Eleventy**
   - Build command: `npx @11ty/eleventy`
   - Output directory: `_site`
4. Every push to `main` auto-deploys; branches/PRs get free preview URLs.
5. Under the Pages project, go to **Custom Domains** and add `giftedhandscreations.com` and `www.giftedhandscreations.com`. Cloudflare issues SSL automatically.
6. If the domain's nameservers aren't already on Cloudflare, update them at the registrar to Cloudflare's assigned nameservers first, then re-check step 5.
7. Once DNS cutover is confirmed working, cancel the old Squarespace hosting.

The `CNAME` file at the repo root records the intended custom domain for reference; Cloudflare Pages custom domains are configured in the dashboard as described above and don't require this file to function.

## Non-functional notes

- Semantic HTML throughout; every image has descriptive `alt` text (empty `alt=""` only on purely decorative card thumbnails that repeat a caption already visible as a heading).
- Per-page `<title>`, meta description, and Open Graph tags via front matter (see `base.njk`).
- `sitemap.xml` and `robots.txt` are generated at build time from `src/sitemap.njk` and `src/robots.txt.njk`.
- No third-party trackers or ads. If you want visitor analytics, Cloudflare Web Analytics (free, no cookies) can be enabled from the Cloudflare dashboard without touching this codebase.
