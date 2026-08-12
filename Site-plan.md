# Site improvement plan

Six sessions. Do them in order — session 3 depends on session 1's nav work, and
session 2's schema needs the address from session 2's research step.

One session per Claude Code conversation. One commit per session. Do not let a
session bleed into the next one's scope.

---

## Session 1 — Cleanup batch

**Scope:** mechanical fixes, no judgment calls.

- [ ] Add `<meta name="robots" content="noindex">` to `reflections.html`,
      `thank-you.html`, and `404.html`. Nothing else in `reflections.html`.
- [ ] Fix `og:url` on the 7 pages carrying a `.html` suffix — `about`,
      `aftercare`, `booking`, `faq`, `gallery`, `games`, `reflections` — to the
      extensionless form matching each page's canonical. Do not add `og:url` to
      pages that lack it; that's out of scope.
- [ ] Add a canonical tag to `links.html`
      (`https://serenitybliss.tattoo/links`) — it's the only page with an
      `og:url` and no canonical.
- [ ] Add `/links` to `sitemap.xml`.
- [ ] Add `loading="lazy"` to the 2nd and 3rd `<img>` in the `.preview-grid` on
      `index.html`. Leave the 1st alone — it has `fetchpriority="high"` and is
      above the fold.
- [ ] In `script.js`, guard against a missing lightbox: after
      `var overlay = document.querySelector('.lightbox-overlay');` add
      `if (!overlay) return;`. Without it, adding `script.js` to a page that has
      no overlay div throws and kills the gallery filters too.
- [ ] Reorder the nav on all 20 pages to: Gallery, About, Booking, FAQ,
      Aftercare, Games, Reflections. Reflections keeps `class="nav-hide"`.
      Current order is alphabetical, which buries Booking.

**Done when:** `grep -c 'href="gallery.html">Gallery'` returns 1 for all 20
files and the nav renders in the new order on every page.

---

## Session 2 — Structured data and NAP

**Scope:** the biggest SEO win available. She is a 1099 contractor, not the
location owner, so a Google Business Profile is not an option. Schema is how
Google learns this is a real business at a real address.

**Blocked until the owner supplies:** studio street address, zip, and studio
phone number. Supplied: 6751 Fairmont Pkwy, Pasadena, TX 77505 / (281) 416-4874.

- [x] Build a footer NAP block — business name, street address, city/state/zip,
      phone — and apply it identically to all 20 pages, above the existing
      Location/Email/Instagram lines. Applied to 19 pages
      (`reflections-preview.html` excluded — hands-off per CLAUDE.md).
- [x] Add a JSON-LD `<script type="application/ld+json">` block to
      `index.html`: `@type: TattooParlor` with `name`, `address` as a nested
      `PostalAddress`, `telephone`, `url`, `image`, `sameAs` pointing at the
      Instagram profile, `priceRange`, and `areaServed` listing Pasadena,
      Deer Park, La Porte, Pearland, South Houston, and Houston. `priceRange`
      set to `$$` (symbolic) rather than a dollar figure — no confirmed
      session-total pricing exists yet; revisit once Session 4 supplies a
      real price anchor.
- [x] Add a nested or sibling `Person` entry for the artist. Nested as
      `employee` on the `TattooParlor` block: name "Serenity", jobTitle
      "Tattoo Artist".
- [x] Add a `FAQPage` JSON-LD block to `faq.html` built from the questions
      already on the page. Do not invent Q&As — use the existing headings and
      copy.
- [x] Validate both blocks at Google's Rich Results Test.
      `index.html`: 2 valid items (Local business, Organization), zero errors.
      `faq.html`: "No items detected" — not a markup defect. Google restricted
      FAQ rich results to an allowlist of government/health sites in August
      2023; the test tool no longer evaluates FAQPage eligibility for sites
      outside that list. The JSON-LD itself is valid (confirmed via local JSON
      parse) and live on the page — it just won't earn a rich snippet under
      current Google policy. Left in place: harmless, and other search engines
      or a future policy change can still use it.

**Done when:** both blocks validate with zero errors and the NAP appears on all
19 pages (`reflections-preview.html` excluded — hands-off per CLAUDE.md).

---

## Session 3 — Heading structure

**Scope:** every page currently has the same `h1` — the logo image. No page has
a text `h1`. Titles carry the keywords, headings carry nothing.

- [ ] On every page, change `<h1><img class="site-logo" ...></h1>` to
      `<a href="index.html"><img class="site-logo" ...></a>`. On `index.html`
      the logo is not currently wrapped in a link; every other page wraps the
      `h1` in one. Normalize them all.
- [ ] Promote each page's `<h2>` page title to `<h1>`, rewritten for search
      intent:
      - `index.html` → Custom Tattoos in Pasadena, TX
      - `gallery.html` → Tattoo Portfolio
      - `about.html` → About Serenity
      - `booking.html` → Book a Tattoo Appointment
      - `faq.html` → Tattoo FAQ, Pricing & Policies
      - `aftercare.html` → Tattoo Aftercare Instructions
      - the rest keep their current wording, just promoted
- [ ] Fix the CSS fallout. The `h1` rule currently carries the gold gradient and
      `.site-logo` sits inside it. After this change the `h1` rule styles text,
      and `.site-logo` needs its own rule outside the `h1` context. The existing
      `h2` gradient rule is the reference for what the new `h1` should look like.

**Done when:** every page has exactly one `h1`, it is text not an image, the
logo still links home, and nothing looks different visually except the page
title styling.

---

## Session 4 — Content (not a Claude Code session)

The owner writes these. Nothing to build until they exist.

- [ ] 3 client testimonials, with permission, name or initials plus the piece
- [ ] One short areas-served paragraph for the homepage naming the surrounding
      towns
- [ ] A price anchor to sit on the booking page, e.g. a typical range for a
      half-day piece
- [ ] Set up `serenity@serenitybliss.tattoo` forwarding in Spaceship

Once written, a short Claude Code session places the testimonials on the
homepage, drops in the paragraph, and find-and-replaces every `mailto:` plus the
schema `email` field.

---

## Session 5 — Form and gallery polish

- [ ] Booking form: the medical conditions field is a required `<textarea>` with
      no "none" option, so most people will type "n/a". Convert it to a Yes/No
      radio pair plus a conditional textarea. Copy the existing allergies
      pattern exactly — `allergies-yes` / `allergies-no` /
      `allergies-followup` and its toggle function are the template.
- [ ] Make the phone field optional. Email is already required and is the
      stated contact channel.
- [ ] Add a books-open/closed status line at the top of `booking.html`, in a
      clearly marked block the owner can hand-edit. Currently the FAQ sends
      people to Instagram for booking status, which loses them at peak intent.
- [ ] Gallery captions: add a short line under each image with placement, style,
      and session count. Content comes from the owner; build the markup and CSS
      with placeholders if the copy is not ready.
- [ ] The FAQ page runs ~2,000 words in one column. Either add an anchor-link
      table of contents at the top or convert the sections to `<details>`
      accordions. Pick one and say why.

---

## Session 6 — Accessible lightbox

**Scope:** the lightbox in `script.js` has no close button, no dialog
semantics, no focus management. Keyboard users get stranded in it.

- [ ] Add a visible close button.
- [ ] Add `role="dialog"` and `aria-modal="true"` to the overlay.
- [ ] Move focus to the close button on open; return it to the triggering
      gallery button on close.
- [ ] Trap Tab within the dialog while it is open.
- [ ] Escape closes. The close button closes. Clicking the backdrop closes.
      Clicking the image itself does **not** close — that is the current bug.

Reference the WAI-ARIA Authoring Practices modal dialog pattern. Explain how the
focus trap works rather than just pasting an implementation.

---

## Later, low priority

- [ ] Convert `Serenity-Header.jpg` (122 KB for a wordmark) to SVG
- [ ] Surface the Spanish aftercare page from the main nav, not just from the
      English aftercare page
- [ ] Add `<lastmod>` to `sitemap.xml`, and add `/reflections` once it ships
