# Gifted Hands Creations

Static, informational/portfolio site for **Gifted Hands Creations** — a veteran-owned, handmade woodcraft shop (American flag art, wooden heart décor, custom engraved keepsakes). Built with [Eleventy (11ty)](https://www.11ty.dev/) and plain CSS; the only server-side code is a single small function that relays the contact form.

This is **not** a storefront — there's no cart, checkout, or pricing. It's a fast, free-to-host home for the brand's story and gallery, with a way for people to reach out.

## Tech stack

- **Eleventy (11ty)** — static site generator, output to `_site/`
- **Plain CSS** with custom properties — mobile-first, no framework
- **Plain JS**, one small self-contained file per feature (`src/assets/js/`) — no framework, no build step, no bundler. Each script no-ops if the element it targets isn't on the page, so they're safe to load on every page.
- Content lives in **Nunjucks pages** (`src/*.njk`) and **JSON data** (`src/_data/`), so it's easy to hand-edit or later wire up a headless CMS (e.g. Decap CMS). Pages use `.njk` rather than `.md` because they're structural HTML/template layouts, not prose — Eleventy's Markdown pipeline mangles indented HTML blocks.
- **Cloudflare Pages** for free hosting + automatic deploys from GitHub, plus one small **Cloudflare Pages Function** (`functions/api/contact.js`) — the only server-side code in the project, used solely to relay the contact form to an email API. Everything else is static.

## Local development

```bash
npm install
npm start        # serves the site at http://localhost:8080 with live reload
npm run build     # builds the production site into _site/
```

## Project structure

```
functions/
└── api/contact.js                # Cloudflare Pages Function — POST /api/contact, emails via Resend

src/
├── _includes/
│   ├── layouts/base.njk         # shared HTML shell (head, header, footer, lightbox markup, back-to-top button, script tags)
│   └── partials/
│       ├── header.njk, footer.njk
│       ├── contact-form.njk     # shared {% macro contactForm(submitLabel) %} — posts to /api/contact, includes honeypot + error banner
│       └── collection-detail.njk # shared {% macro collectionDetail(slug) %} — breadcrumb + BreadcrumbList JSON-LD, prev/next pager (top + bottom), heading, lightbox-enabled image grid, custom-order CTA
├── _data/
│   ├── site.json                 # site name, tagline, hero copy, email, social links, trust badges
│   └── portfolio.json            # the 3 gallery collections + their images (all real photos, with real width/height per image)
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── nav.js                # mobile nav toggle
│   │   ├── lightbox.js           # gallery image lightbox (keyboard nav, touch swipe, focus management)
│   │   ├── back-to-top.js        # back-to-top button, shows after scrolling past a threshold
│   │   └── contact-status.js     # reveals the contact form's error banner when redirected with ?error=1
│   └── images/                   # all real photos/logo/badges; a couple of unused original source files are also kept (see below)
├── index.njk                     # Home
├── gallery/
│   ├── index.njk                 # Gallery landing (3 large linked photos + h1, no other text)
│   ├── stars-and-stripes.njk     # thin wrapper: collectionDetail("stars-and-stripes")
│   ├── from-the-heart.njk
│   └── crafted-keepsakes.njk
├── about.njk                     # bio/story + an embedded "Contact us" section
├── contact.njk                   # full Contact Us page
├── thank-you.njk                 # shown after a successful contact form submission
├── 404.njk                       # custom not-found page (Cloudflare Pages serves this automatically)
├── sitemap.njk                   # generates /sitemap.xml at build (404/thank-you excluded)
└── robots.txt.njk                # generates /robots.txt at build
```

## Editing content

- **Site-wide info** (name, tagline, hero heading/copy/CTA, email, social links, trust badges + descriptions): `src/_data/site.json`
- **Gallery collections & images**: `src/_data/portfolio.json`. Each collection has a `slug`, `title` (and optional `navTitle` used for on-page headings, the prev/next pager, and breadcrumbs, where it differs from the footer/nav `title`), descriptions, `heroImage`/`heroImageWebp`/`heroImageAlt` (home page cards), `galleryPageImage`/`galleryPageImageWebp`/`galleryPageImageAlt` (gallery landing page), `imageAspectRatio` (controls the uniform tile shape on that collection's grid, e.g. `"16 / 9"` or `"1 / 1"`), and an `images` array (`src`, `webp`, `alt`, `w`, `h` — real pixel dimensions, used to prevent layout shift). The three gallery detail pages pull from this file by `slug` via the shared `collectionDetail` macro — add/reorder photos there without touching any template. The prev/next pager and lightbox order follows the array order in this file.
- **Page copy** (Home intro, About story/signature, Contact blurb): edit the HTML/Nunjucks directly in `src/index.njk`, `src/about.njk`, `src/contact.njk`.
- **Contact form fields**: both the About page's embedded form and the standalone Contact page render `{{ contactForm(submitLabel) }}` from `src/_includes/partials/contact-form.njk` — edit the fields once, both places update. See "Contact form" below for how submissions are delivered.
- **Per-page SEO**: each page's front matter (`title`, `description`, optional `image`) drives the `<title>` and meta/Open Graph tags in `src/_includes/layouts/base.njk`. Set `image` (a path like `/assets/images/about-workbench.jpg`) on any page that should show its own photo when shared on social media instead of the site-wide default (`hero-home.jpg`) — every current page already does this.
- **New pages that shouldn't appear in the sitemap or nav** (like `404.njk`/`thank-you.njk`): add `eleventyExcludeFromCollections: true` to the front matter, the same way `sitemap.njk` and `robots.txt.njk` already do.

### A note on Nunjucks macro imports

If a macro reads global data (`site`, `portfolio`, etc.), import it with `{% from "partials/foo.njk" import bar with context %}` — the `with context` is required, or the macro silently renders empty (or missing values) because it can't see the data cascade. Both `contactForm` and `collectionDetail` read globals now, so every import site uses `with context`. This bit twice during development — once for `collectionDetail`, once when an error-banner `{{ site.email }}` was added to `contactForm` — so if a macro's output goes unexpectedly blank, check this first.

### Images

`src/assets/images/` holds the real, in-use photos for every page — hero, about, contact, all three gallery collections (their card thumbnails, gallery-landing photos, and full detail-page grids), badges, logo, and signature. Most have a matching `.webp` alongside the `.jpg`/`.png` for the `<picture>` fallback pattern used throughout:

```html
<picture>
  <source srcset="/assets/images/flag-01.webp" type="image/webp">
  <img src="/assets/images/flag-01.jpg" alt="..." loading="lazy" width="800" height="600">
</picture>
```

A handful of original, unprocessed source files are also kept in the folder in case a different crop/size is ever needed later (e.g. `ghc_logo.jpg`, `Signature2.png`, `made_in_usa2.png`, `supremequality.png`, `unique2.png`, `veteran owned4.png`, `homePage_bg.png`, `about_us.png`, `contact_us.png`, and the per-collection upload folders like `StarsandStripes/`, `hearts/`, `craftedkeepsakes/`) — these aren't referenced by any template, so they're safe to ignore or delete if the repo ever needs tidying.

To add a photo to an existing collection: export WebP + JPEG, drop both in `src/assets/images/`, then add an entry to that collection's `images` array in `portfolio.json` with real `w`/`h` dimensions and descriptive `alt` text. It'll automatically pick up the lightbox and the collection's tile aspect ratio — no template changes needed.

### Contact form

The contact form (`src/_includes/partials/contact-form.njk`, used on both `/about/` and `/contact/`) posts to `/api/contact`, handled by the Cloudflare Pages Function at `functions/api/contact.js`. Cloudflare Pages automatically deploys anything under `/functions` at the repo root alongside the static build — no `wrangler.toml` needed for this.

The function validates the submission and runs it through three spam checks before sending anything:

1. A **honeypot field** (`website` — hidden from real visitors with CSS, but bots tend to fill in every field they find).
2. A **timestamp check** — a hidden `formLoadedAt` field is stamped with the time the page loaded; submissions arriving less than 2 seconds later (bots blind-POSTing the endpoint) are rejected.
3. A **[Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)** challenge, verified server-side against Cloudflare's `siteverify` API — this is what actually stops bots that render the real page and skip the honeypot/timing tells.

The honeypot and timestamp checks fail silently (pretend success, same as a real submission) so bots don't learn to route around them; a failed Turnstile check or missing/invalid form fields sends the visitor back to `/contact/?error=1`. On success the function sends the message as an email through [Resend](https://resend.com) and redirects to `/thank-you/`; on any failure (validation, spam, Resend API error) it redirects back to `/contact/?error=1`, which the page detects via `src/assets/js/contact-status.js` to reveal an inline error banner.

**One-time setup before the form will actually deliver email:**

1. Create a free Resend account at [resend.com](https://resend.com) (free tier: 100 emails/day, 3,000/month — plenty for a contact form).
2. Add and verify `giftedhandscreations.com` as a sending domain in Resend. It will give you a handful of DNS records (SPF/DKIM) to add — since the domain's nameservers are already on Cloudflare, add them under **DNS** in the Cloudflare dashboard for this zone.
3. Create an API key in Resend.
4. In the Cloudflare Pages project: **Settings → Environment variables** → add `RESEND_API_KEY` as an **encrypted** variable with that key. Optionally also set `CONTACT_TO_EMAIL` (defaults to `slenoah.jackson@gmail.com`) and `CONTACT_FROM_EMAIL` (defaults to `Gifted Hands Creations Website <website@giftedhandscreations.com>` — the address part must be on the domain you verified in step 2).
5. Redeploy (or trigger a new deploy) so the Function picks up the new environment variables.

Until step 2–4 are done, form submissions will fail gracefully (visitor sees the error banner with a mailto: fallback) rather than silently disappearing.

MailChannels, the email service Cloudflare Workers/Pages used to integrate with for free, was deprecated — Resend is the current recommended replacement and is what this Function uses.

**Turnstile setup (separate from Resend, also required for the form to accept submissions):**

1. In the Cloudflare dashboard: **Turnstile → Add widget**. Give it a name, add `giftedhandscreations.com` as the domain, and choose the **Managed** challenge type (usually invisible to real visitors).
2. Cloudflare gives you a **Site Key** and a **Secret Key**. The Site Key is public by design (it's embedded in the page HTML) — put it in `src/_data/site.json` as `turnstileSiteKey`, replacing the `YOUR_TURNSTILE_SITE_KEY` placeholder, and commit it.
3. The Secret Key must stay private — add it in the Cloudflare Pages project as **Settings → Environment variables** → `TURNSTILE_SECRET_KEY` (encrypted), the same way as `RESEND_API_KEY`.
4. Redeploy so both the new site content (with the real site key baked in) and the Function (reading the new secret) go out together.

Until this is done, every submission fails the Turnstile check server-side and the visitor sees the error banner — so treat it as required, not optional, alongside the Resend setup above.

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

- Semantic HTML throughout; every image has descriptive `alt` text (empty `alt=""` only on purely decorative card thumbnails that repeat a caption already visible as a heading). Every page has exactly one `<h1>`.
- Per-page `<title>`, meta description, and Open Graph tags (including a per-page `image`) via front matter (see `base.njk`).
- Collection pages have a Home / Gallery / Collection breadcrumb trail with matching `BreadcrumbList` JSON-LD, so search engines can show the trail directly in results.
- `sitemap.xml` and `robots.txt` are generated at build time from `src/sitemap.njk` and `src/robots.txt.njk`; non-content pages (`404.njk`, `thank-you.njk`) are excluded via `eleventyExcludeFromCollections`.
- Colors are WCAG AA contrast-checked. `--color-gold` (used for icons and text on dark backgrounds) doesn't meet 4.5:1 against the cream backgrounds, so a separate `--color-gold-deep` token is used anywhere gold appears as hover/focus/current-page text on a light background (nav, collection pager, collection card titles).
- No third-party trackers or ads. If you want visitor analytics, Cloudflare Web Analytics (free, no cookies) can be enabled from the Cloudflare dashboard without touching this codebase.
