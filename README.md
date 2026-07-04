# Gifted Hands Creations

Static, informational/portfolio site for **Gifted Hands Creations** — a veteran-owned, handmade woodcraft shop (American flag art, wooden heart décor, custom engraved keepsakes). Built with [Eleventy (11ty)](https://www.11ty.dev/), plain CSS, and no backend.

This is **not** a storefront — there's no cart, checkout, or pricing. It's a fast, free-to-host home for the brand's story and gallery, with a way for people to reach out.

## Tech stack

- **Eleventy (11ty)** — static site generator, output to `_site/`
- **Plain CSS** with custom properties — mobile-first, no framework
- Content lives in **Nunjucks pages** (`src/*.njk`) and **JSON data** (`src/_data/`), so it's easy to hand-edit or later wire up a headless CMS (e.g. Decap CMS). Pages use `.njk` rather than `.md` because they're structural HTML/template layouts, not prose — Eleventy's Markdown pipeline mangles indented HTML blocks.
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
│   ├── layouts/base.njk         # shared HTML shell (head, header, footer)
│   └── partials/
│       ├── header.njk, footer.njk
│       ├── contact-form.njk     # shared {% macro contactForm(submitLabel) %}
│       └── collection-detail.njk # shared {% macro collectionDetail(slug) %} — heading + image grid + prev/next pager
├── _data/
│   ├── site.json                 # site name, tagline, hero copy, email, social links, trust badges
│   └── portfolio.json            # the 3 gallery collections + their images
├── assets/
│   ├── css/style.css
│   ├── js/nav.js                 # mobile nav toggle
│   └── images/                   # real logo/badges/photos are in; gallery thumbnails are still placeholder SVGs
├── index.njk                     # Home
├── gallery/
│   ├── index.njk                 # Gallery landing (3 large linked photos, no text)
│   ├── stars-and-stripes.njk     # thin wrapper: collectionDetail("stars-and-stripes")
│   ├── from-the-heart.njk
│   └── crafted-keepsakes.njk
├── about.njk                     # bio/story + an embedded "Contact us" section
├── contact.njk                   # full Contact Us page
├── sitemap.njk                   # generates /sitemap.xml at build
└── robots.txt.njk                # generates /robots.txt at build
```

## Editing content

- **Site-wide info** (name, tagline, hero heading/copy/CTA, email, social links, trust badges + descriptions): `src/_data/site.json`
- **Gallery collections & images**: `src/_data/portfolio.json`. Each collection has a `slug`, `title` (and optional `navTitle` used for on-page headings and the prev/next pager, where it differs from the footer/nav `title`), descriptions, and an `images` array (`src` + `alt` text). The three gallery detail pages pull from this file by `slug` via the shared `collectionDetail` macro — add/reorder photos there without touching any template. The prev/next pager order follows the array order in this file.
- **Page copy** (Home intro, About story/signature, Contact blurb): edit the HTML/Nunjucks directly in `src/index.njk`, `src/about.njk`, `src/contact.njk`.
- **Contact form fields**: both the About page's embedded form and the standalone Contact page render `{{ contactForm(submitLabel) }}` from `src/_includes/partials/contact-form.njk` — edit the fields once, both places update.
- **Per-page SEO**: each page's front matter (`title`, `description`) drives the `<title>` and meta/Open Graph tags in `src/_includes/layouts/base.njk`.

### A note on Nunjucks macro imports

If you add a new macro that reads global data (`site`, `portfolio`, etc.), import it with `{% from "partials/foo.njk" import bar with context %}` — the `with context` is required, or the macro renders empty because it can't see the data cascade. `contact-form.njk`'s macro doesn't touch globals, so it's imported without `with context`.

### Images: what's real vs. placeholder

The logo (`ghc_logo-web.png`), all four trust badges, the owner's signature, the hero background, and the About/Contact photos are the real uploaded assets — resized and (where needed) background-removed from the originals, which are also kept in the repo unmodified (`ghc_logo.jpg`, `Signature2.png`, `made_in_usa2.png`, `supremequality.png`, `unique2.png`, `veteran owned4.png`, `homePage_bg.png`, `about_us.png`, `contact_us.png`) in case you ever need to re-derive a different crop or size.

The **gallery collection thumbnails and detail-page grids** (Stars & Stripes, From the Heart, Crafted Keepsakes) are still placeholder SVGs labeled "Photo coming soon" — swap those in the same way:

1. Export real photos as **WebP** (with a JPEG fallback for older browsers) and drop them in `src/assets/images/`.
2. Update the `src`/`alt` fields for the relevant collection in `src/_data/portfolio.json`.
3. Keep `loading="lazy"` on below-the-fold images.
4. For the WebP-with-fallback pattern (already used for the hero/about/contact photos), use `<picture>`:
   ```html
   <picture>
     <source srcset="/assets/images/flag-01.webp" type="image/webp">
     <img src="/assets/images/flag-01.jpg" alt="..." loading="lazy" width="800" height="600">
   </picture>
   ```
   The gallery grid currently renders plain `<img>` tags from `portfolio.json`, so switching a collection to `<picture>` means editing `collection-detail.njk` (and the home/gallery-landing card markup) rather than the JSON alone — or just ship `.jpg`/`.png` there and skip the WebP variant if that's simpler.

### Contact form

The contact form (`src/_includes/partials/contact-form.njk`, used on both `/about/` and `/contact/`) posts to `/api/contact`, handled by the Cloudflare Pages Function at `functions/api/contact.js`. Cloudflare Pages automatically deploys anything under `/functions` at the repo root alongside the static build — no `wrangler.toml` needed for this.

The function validates the submission, rejects obvious spam via a honeypot field (`website` — hidden from real visitors with CSS, but bots tend to fill in every field they find), and sends the message as an email through [Resend](https://resend.com). On success it redirects to `/thank-you/`; on failure (missing fields, spam, or a Resend API error) it redirects back to `/contact/?error=1`, which the page detects via `src/assets/js/contact-status.js` to reveal an inline error banner.

**One-time setup before the form will actually deliver email:**

1. Create a free Resend account at [resend.com](https://resend.com) (free tier: 100 emails/day, 3,000/month — plenty for a contact form).
2. Add and verify `giftedhandscreations.com` as a sending domain in Resend. It will give you a handful of DNS records (SPF/DKIM) to add — since the domain's nameservers are already on Cloudflare, add them under **DNS** in the Cloudflare dashboard for this zone.
3. Create an API key in Resend.
4. In the Cloudflare Pages project: **Settings → Environment variables** → add `RESEND_API_KEY` as an **encrypted** variable with that key. Optionally also set `CONTACT_TO_EMAIL` (defaults to `hello@giftedhandscreations.com`) and `CONTACT_FROM_EMAIL` (defaults to `Gifted Hands Creations Website <website@giftedhandscreations.com>` — the address part must be on the domain you verified in step 2).
5. Redeploy (or trigger a new deploy) so the Function picks up the new environment variables.

Until step 2–4 are done, form submissions will fail gracefully (visitor sees the error banner with a mailto: fallback) rather than silently disappearing.

MailChannels, the email service Cloudflare Workers/Pages used to integrate with for free, was deprecated — Resend is the current recommended replacement and is what this Function uses.

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
