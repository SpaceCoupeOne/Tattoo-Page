/* Rewrites every <lastmod> in sitemap.xml from real git history, one date
   per page. Run by hand after committing content changes, before you push -
   see the "Sitemap lastmod" note in CLAUDE.md for why this has to stay
   a deliberate step instead of a blind stamp.

   Google either trusts a sitemap's lastmod values as a set or ignores all
   of them the moment any look unreliable, so a wrong date on one page is
   worse than no dates at all. Pulling every date straight from `git log`
   is what keeps them honest: a page's lastmod is only ever the date its
   own file actually last changed, not "whenever this script last ran." */

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const SITEMAP = 'sitemap.xml';
const SITE = 'https://serenitybliss.tattoo';

/* Reverses the clean-URL convention in CLAUDE.md: the sitemap lists
   extensionless URLs (Netlify serves /gallery, not /gallery.html), so the
   file on disk is the URL's last path segment plus .html, or index.html
   for the root. */
function urlToFile(url) {
  const path = url.replace(SITE, '').replace(/^\/+/, '');
  return path === '' ? 'index.html' : `${path}.html`;
}

/* The date a file last actually changed, per git - not today's date, and
   not "whenever this script runs." A file with no commits yet (just
   created, not committed) has nothing to report; skip it rather than
   guess. */
function lastModified(file) {
  try {
    const out = execFileSync(
      'git', ['log', '-1', '--format=%cd', '--date=short', '--', file],
      { encoding: 'utf8' }
    ).trim();
    return out || null;
  } catch {
    return null;
  }
}

let xml = readFileSync(SITEMAP, 'utf8');
const urlBlockRe = /<url>\s*<loc>(.*?)<\/loc>\s*(?:<lastmod>.*?<\/lastmod>\s*)?<\/url>/g;

let updated = 0;
let skipped = [];

xml = xml.replace(urlBlockRe, (whole, loc) => {
  const file = urlToFile(loc.trim());
  const date = lastModified(file);
  if (!date) {
    skipped.push(file);
    return whole;
  }
  updated++;
  return `<url>\n    <loc>${loc.trim()}</loc>\n    <lastmod>${date}</lastmod>\n  </url>`;
});

writeFileSync(SITEMAP, xml);
console.log(`Updated ${updated} <lastmod> date(s) in ${SITEMAP}.`);
if (skipped.length) {
  console.log('Skipped (no git history found for): ' + skipped.join(', '));
}
