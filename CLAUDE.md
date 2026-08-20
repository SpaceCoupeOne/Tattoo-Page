# Serenity Bliss Tattoos — serenitybliss.tattoo

Portfolio and booking site for a tattoo artist working as a 1099 contractor at
Red Dagger Tattoo in Pasadena, TX.

## Stack

- Plain HTML, CSS, JS. No framework, no build step, no bundler, no npm.
- 20 static `.html` files at the repo root. No templating — **the header, nav,
  and footer are copy-pasted into every page.**
- One stylesheet: `style.css` (~1,650 lines).
- One shared script: `script.js` (lightbox + gallery filters). Loaded only by
  `index.html` and `gallery.html`.
- Page-specific JS lives in inline `<script>` blocks at the bottom of that page.
- Hosted on Netlify, deployed from GitHub `main`. Domain from Spaceship.
- Local dev: VS Code + Live Server extension.

## Owner

The owner is learning web development while building this. When making changes,
briefly explain *why* an approach is correct, not just what changed. Prefer the
plain, readable version over the clever one. Do not introduce new dependencies,
frameworks, or build tooling.

## Conventions — follow these exactly

**Nav and footer are duplicated across all pages.** Any change to them must be
applied to every `.html` file. Never update one page and stop. Verify with grep
after editing.

**`style.css` has an ordering rule stated in a comment at the top of the file:
all `@media` blocks stay at the end.** New base rules go above them. Do not add
a media query in the middle of the file.

**Images go through Netlify's image CDN.** The pattern is:

    /.netlify/images?url=/Photos/Name.jpg&w=600&fm=webp

Gallery thumbs use `w=600`, lightbox fulls use `w=1600` via `data-full`, the
homepage previews use `w=700`, the header logo uses `w=1100`. Always include
explicit `width` and `height` attributes to prevent layout shift. Keep the raw
source files in `Photos/` untouched.

**Forms are Netlify Forms**, not a third-party service. They need
`data-netlify="true"`, a `netlify-honeypot="bot-field"`, and a matching hidden
`form-name` input. Free tier caps at 100 submissions/month across all forms.

**Clean URLs.** Netlify serves `/gallery`, not `/gallery.html`. Canonical tags
and the sitemap use the extensionless form. Internal `href`s use `.html` and
Netlify resolves them.

**CSS/JS caching.** `_headers` sets `/*.css` and `/*.js` to
`Cache-Control: public, max-age=0, must-revalidate` — not a long max-age.
There's no filename fingerprinting (no hashed filenames, no build step to
generate them), so a long cache on `style.css`/`script.js`/`calendar.js`
means returning visitors can be stuck on stale CSS/JS for days with no way
to bust it. `max-age=0, must-revalidate` makes the browser check with
Netlify on every load (a cheap 304 if unchanged) instead of trusting a
local copy. Since existing visitors' browsers may already be holding the
old week-long cache from before this changed, every reference to these
three files across the HTML pages carries a `?v=N` query string to force a
fresh fetch past that old cache. Each file tracks its own version number,
independent of the others (currently `style.css?v=9`, `script.js?v=4`,
`calendar.js?v=3`). Bump a file's number on every subsequent change to
it — everywhere that file is referenced, not the other two — to force
another one-time refetch.

## Colors

Defined as CSS custom properties in `:root` at the top of `style.css`. Use the
variables, never raw hex values, in new rules.

Dark teal background, cream text, gold and coral accents. Headings use a gold to
coral gradient clipped to the text.

## Hands off

- `reflections.html`, `reflections-preview.html`, `Page-videos/`, `Audio/` —
  unfinished work in progress, blocked on media licensing. Do not refactor,
  restyle, or "fix" these. The only sanctioned change is adding a `noindex`
  meta tag.
- `Photos/` filenames and the `Coloring/` art. The coloring pages currently use
  placeholder art pending replacement.

## Before saying a task is done

1. Open every changed page with Live Server and look at it.
2. If the nav or footer changed, confirm all 20 pages match.
3. If structured data changed, validate at Google's Rich Results Test.
4. Report what you changed and what you did not verify.
