# Jusheng Zhang — Academic Homepage

Static research website and blog for Jusheng Zhang, served by GitHub Pages.

- Website: https://jushengzhang.github.io/
- Entry point: `index.html`
- Blog: `posts/` (the sample article is clearly marked as a layout preview)
- Complete publication list: `research/`
- Experience, service, and contact: `about/`
- Previous homepage: `preview/writing/`
- Images, preview videos, and shared fonts: `assets/`
- Website styles, interactions, and additional licensed font: `style.css`, `site.js`, `fonts/`

The former preview subpages redirect to the corresponding public pages. Links to papers and sections from the previous homepage remain supported.

## Publish

In the repository's **Settings → Pages**, select **Deploy from a branch**, then **main** and **/ (root)**. The `.nojekyll` file enables direct static-file serving.

## Local preview

Run `python3 -m http.server 8000` from this directory and visit http://localhost:8000. Serving over HTTP lets the root-relative asset and navigation paths work across every page.

## Visitor statistics

The homepage retains the existing anonymous collector in `analytics.js`. It runs only on the production HTTPS hostname; reports are private. The previous homepage and subpages do not send homepage pageviews. The visitor identifier and opt-out preference continue to use the existing browser storage keys.

## Assets

Publication figures and preview media belong to their respective authors and projects. Institution marks belong to their respective institutions. Font licenses and source details are included in `assets/fonts/` and `fonts/`.
