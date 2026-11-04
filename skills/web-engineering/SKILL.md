---
name: web-engineering
description: "web work is fast, accessible and discoverable by default. Use when building or reviewing web UI, pages or front-end delivery."
---

# Web engineering

Intent: a page loads fast, works for every user, and is found by search, on the first build.

## When to use
- Building or reviewing web UI, pages or front-end delivery.

## How to work
1. Treat performance as a feature: optimize the critical rendering path and Core Web Vitals, compress with gzip or Brotli, lazy-load non-critical routes, and serve responsive images (srcset) in modern formats (WebP, AVIF) with tiered caching.
2. Build for accessibility: meet WCAG 2.1 AA, lay out mobile-first and responsive, use semantic HTML (`<button>`, `<main>`), add `aria-label` where semantics fall short, and give immediate visual feedback for every user action.
3. Make the content discoverable: ship sitemap.xml, robots.txt and JSON-LD structured data, and choose the rendering strategy (SSR, SSG, ISR) by how dynamic the page is and its SEO needs.
4. Compose the UI from small, reusable, testable components (atomic design).
