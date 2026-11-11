# CLAUDE.md — Gifted Hands Creations website

Read this first in every session. `README.md` has the full detail; this file
is the short version plus the rules to follow.

## What this is

The marketing/portfolio site for **Gifted Hands Creations**, a veteran-owned,
handmade woodcraft business (American flag art, wooden heart décor, custom
engraved keepsakes). Live at `giftedhandscreations.com`.

It is **not a store**: no cart, checkout, or prices. Sales happen on Etsy
(linked from `src/_data/site.json`). Don't add e-commerce features unless the
owner asks.

The owner is still learning the tools. Explain changes in plain language, keep
changes small, and say what they will see on the site afterwards.

## Tech stack

- **Eleventy (11ty) v2**: static site generator. Source in `src/`, output in `_site/` (git-ignored).
- **Nunjucks** templates (`.njk`), **plain CSS** (`src/assets/css/style.css`), **plain JS** (one small file per feature in `src/assets/js/`).
- No frameworks, bundlers, or CSS libraries. Keep it that way.
- **Cloudflare Pages** hosts it. `functions/api/contact.js` is a Cloudflare Pages Function (the only server code) that sends contact-form emails through Resend, with honeypot, timing, and Turnstile spam checks.

## Commands

```bash
npm install
npm start        # dev server with live reload at http://localhost:8080
npm run build    # production build into _site/ — run this before every commit
```

There are no automated tests. "Done" means `npm run build` finishes with no
errors, and for visual changes, the page has been checked at phone and desktop
widths.

## Where things live

| To change… | Edit |
|---|---|
| Business name, tagline, hero text, email, social links, trust badges | `src/_data/site.json` |
| Gallery collections and their photos | `src/_data/portfolio.json` |
| Page wording (Home, About, Contact) | `src/index.njk`, `src/about.njk`, `src/contact.njk` |
| Header / footer | `src/_includes/partials/header.njk`, `footer.njk` |
| Shared page shell, meta/SEO tags | `src/_includes/layouts/base.njk` |
| Contact form fields (used on About + Contact) | `src/_includes/partials/contact-form.njk` |
| Collection detail page layout (all 3 galleries) | `src/_includes/partials/collection-detail.njk` |
| Colors, fonts, spacing | CSS variables at the top of `src/assets/css/style.css` |
| Contact form email delivery | `functions/api/contact.js` |

## Conventions and gotchas

- **Adding a gallery photo:** put a `.webp` and a `.jpg` in `src/assets/images/`, then add an entry to that collection's `images` array in `portfolio.json` with real pixel `w`/`h` and descriptive `alt`. No template changes needed.
- **Images** use the `<picture>` pattern: WebP source plus JPG/PNG fallback, with `width`/`height` and `loading="lazy"` below the fold.
- **Macro imports need `with context`:** `{% from "partials/x.njk" import y with context %}`. Without it a macro silently renders blank. This has broken things twice.
- **Accessibility:** one `<h1>` per page and real `alt` text on every image. Colors are WCAG AA checked, so use `--color-gold-deep` (not `--color-gold`) for gold text on cream backgrounds.
- **Every page needs front matter** with `title`, `description`, and `image` (used for SEO and social sharing previews).
- Utility pages (404, thank-you) use `eleventyExcludeFromCollections: true` so they stay out of the sitemap.
- New JS goes in its own small file in `src/assets/js/` and must do nothing on pages where its target element is missing.
- Some files in `src/assets/images/` (e.g. `craftedkeepsakes/`, `about_us.png`) are unused originals. Don't delete them without asking.
- Brand voice: warm, heartfelt, craftsman/rustic-Americana. Mention that the business is veteran-owned and every piece is one of a kind.

## Secrets and settings — never commit these

`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `CONTACT_TO_EMAIL` and
`CONTACT_FROM_EMAIL` are set in the Cloudflare Pages dashboard, not in the repo.
`turnstileSiteKey` in `site.json` is public by design and fine to commit.

## Git and deploying

- Cloudflare Pages auto-deploys the production branch, so a push there **changes the live site**. Work on a separate branch, and only merge to production when the owner says to.
- Other branches get free Cloudflare preview URLs, which are useful for showing the owner a change before it goes live.
- Never commit `node_modules/`, `_site/`, or `.env`.
