/** HTML templates: layout, header, footer, and page builders. */
import { SITE, DEVICES, HOME_FAQS, FEATURES, STEPS } from "./data.mjs";

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* Inline SVG icons (stroke = currentColor). */
const I = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="m6 9 6 6 6-6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18.5h2"/></svg>',
  monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>',
};

/* Runs before paint: picks saved theme or OS preference, avoids a flash. */
const themeInit = `<script>try{var t=localStorage.getItem('creestion-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}</script>`;

function head({ title, description, path, ogImage, jsonLd }) {
  const url = `${SITE.domain}/${path}`;
  const schemas = (jsonLd || []).map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n");
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
${themeInit}
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.domain}${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE.domain}${ogImage}">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%232563eb'/><text x='50' y='68' font-size='52' text-anchor='middle' fill='white' font-family='system-ui' font-weight='700'>C</text></svg>">
<link rel="stylesheet" href="/styles.css">
${schemas}
</head>`;
}

function header(active) {
  const deviceLinks = DEVICES.map(
    (d) => `<a href="/${d.path}/">${d.name}<span>${d.canvas}</span></a>`
  ).join("");
  const mDeviceLinks = DEVICES.map(
    (d) => `<a class="m-link" href="/${d.path}/">${d.name} screenshots<span>→</span></a>`
  ).join("");
  return `<header class="site-header">
  <div class="wrap header-in">
    <a class="brand" href="/"><span class="brand-mark">C</span><span class="brand-word">creestion</span></a>
    <nav class="site-nav" aria-label="Main">
      <a href="/generator/" class="${active === "generator" ? "on" : ""}">Studio</a>
      <div class="nav-drop">
        <button type="button" aria-haspopup="true">Devices ${I.chev}</button>
        <div class="drop-menu">${deviceLinks}</div>
      </div>
      <a href="/about/" class="${active === "about" ? "on" : ""}">About</a>
    </nav>
    <div class="header-actions">
      <button type="button" class="icon-btn" data-theme-toggle aria-label="Toggle dark mode" aria-pressed="false">
        <span class="only-light">${I.moon}</span><span class="only-dark">${I.sun}</span>
      </button>
      <a class="btn btn-primary btn-sm" href="/generator/">Open Studio</a>
      <button type="button" class="icon-btn menu-btn" data-menu-toggle aria-label="Open menu" aria-expanded="false"><span class="m-open">${I.menu}</span><span class="m-close" style="display:none">${I.x}</span></button>
    </div>
  </div>
  <div class="mobile-menu" data-mobile-menu>
    <a class="m-link" href="/generator/">Studio <span>→</span></a>
    ${mDeviceLinks}
    <a class="m-link" href="/about/">About <span>→</span></a>
    <div class="m-cta"><a class="btn btn-primary" href="/generator/">Open Studio — it's free</a></div>
  </div>
</header>`;
}

function footer() {
  const deviceLinks = DEVICES.map((d) => `<li><a href="/${d.path}/">${d.name} screenshots</a></li>`).join("");
  return `<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="brand" href="/"><span class="brand-mark">C</span><span class="brand-word">creestion</span></a>
      <p>Free manual screenshot studio for every major app store. Design in your browser — nothing to install, nothing to upload.</p>
    </div>
    <nav aria-label="Devices"><h3>Devices</h3><ul>${deviceLinks}</ul></nav>
    <nav aria-label="Product"><h3>Product</h3><ul>
      <li><a href="/generator/">Studio</a></li>
      <li><a href="/about/">About</a></li>
    </ul></nav>
    <nav aria-label="Legal"><h3>Legal</h3><ul>
      <li><a href="/privacy/">Privacy</a></li>
      <li><a href="/terms/">Terms</a></li>
    </ul></nav>
  </div>
  <div class="wrap foot-base"><span>© ${new Date().getFullYear()} Creestion. Free forever.</span></div>
</footer>`;
}

function layout({ title, description, path, ogImage, jsonLd, active, body }) {
  return `<!doctype html>
<html lang="en">
${head({ title, description, path, ogImage, jsonLd })}
<body>
${header(active)}
<main>${body}</main>
${footer()}
<script>
(function(){
  var root = document.documentElement;
  document.querySelectorAll('[data-theme-toggle]').forEach(function(b){
    b.setAttribute('aria-pressed', root.dataset.theme === 'dark' ? 'true' : 'false');
    b.addEventListener('click', function(){
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('creestion-theme', next); } catch(e){}
      b.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    });
  });
  var menuBtn = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (menuBtn && menu) {
    var iOpen = menuBtn.querySelector('.m-open'), iClose = menuBtn.querySelector('.m-close');
    menuBtn.addEventListener('click', function(){
      var open = menu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (iOpen) iOpen.style.display = open ? 'none' : '';
      if (iClose) iClose.style.display = open ? '' : 'none';
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ menu.classList.remove('open'); });
    });
  }
})();
</script>
</body>
</html>`;
}

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Creestion",
  url: SITE.domain,
};

const appSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Creestion Studio",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE.domain}/generator/`,
};

const faqSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: `${SITE.domain}${it.href}`,
  })),
});

function faqBlock(faqs) {
  return `<div class="faq">${faqs
    .map(
      (f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`
    )
    .join("")}</div>`;
}

/* ---------------- Home ---------------- */

export function homePage() {
  const features = FEATURES.map(
    (f) => `<div class="card"><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p></div>`
  ).join("");
  const steps = STEPS.map(
    (s, i) => `<div class="card step"><span class="step-n">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div>`
  ).join("");
  const devices = DEVICES.map(
    (d) => `<a class="card device" href="/${d.path}/">
      <strong>${d.name}</strong><span class="store">${d.store}</span>
      <span class="size">${d.canvas}</span><span class="go">Make ${d.name} screenshots →</span>
    </a>`
  ).join("");
  const body = `
<section class="hero">
  <div class="wrap hero-top">
    <span class="badge"><span class="dot"></span>Free forever · No signup · No watermark</span>
    <h1>App store screenshots,<br>designed in minutes.</h1>
    <p class="lede">Upload your app's screens, arrange them on exact-size canvases for every major store, and export full-resolution PNGs — right in your browser.</p>
    <div class="cta-row center">
      <a class="btn btn-primary btn-lg" href="/generator/">Open the Studio — it's free</a>
      <a class="btn btn-ghost btn-lg" href="#devices">See all devices</a>
    </div>
    <p class="micro">${I.check} iPhone · iPad · Android · Mac · Windows &nbsp;·&nbsp; ${I.check} Your files never leave your device</p>
  </div>
  <div class="hero-showcase">
    <div class="showcase-row">
      <figure class="shot">
        <div class="frame-phone"><div class="scr"><span class="notch"></span><img src="/demo/ai-shot-1.png" alt="iPhone App Store screenshot example" width="296" height="642" loading="lazy"></div></div>
        <figcaption><strong>iPhone</strong>1320 × 2868</figcaption>
      </figure>
      <figure class="shot">
        <div class="frame-tablet"><div class="scr"><img src="/demo/ai-shot-2.png" alt="iPad App Store screenshot example" width="356" height="474" loading="lazy"></div></div>
        <figcaption><strong>iPad</strong>2064 × 2752</figcaption>
      </figure>
      <figure class="shot">
        <div class="frame-phone"><div class="scr"><span class="notch"></span><img src="/demo/ai-shot-3.png" alt="Android Google Play screenshot example" width="296" height="642" loading="lazy"></div></div>
        <figcaption><strong>Android</strong>1080 × 1920</figcaption>
      </figure>
      <figure class="shot">
        <div class="frame-desk r1610"><img src="/demo/desk-1.png" alt="Mac App Store screenshot example" width="524" height="328" loading="lazy"></div>
        <figcaption><strong>Mac</strong>2880 × 1800</figcaption>
      </figure>
      <figure class="shot">
        <div class="frame-desk r169"><img src="/demo/desk-3.png" alt="Microsoft Store screenshot example" width="568" height="320" loading="lazy"></div>
        <figcaption><strong>Windows</strong>3840 × 2160</figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="strip"><div class="wrap stats">
  <div><strong>5</strong><span>device canvases</span></div>
  <div><strong>100%</strong><span>free forever</span></div>
  <div><strong>0</strong><span>signups · uploads</span></div>
  <div><strong>4K</strong><span>max export size</span></div>
</div></section>

<section class="wrap section"><h2>Everything you need for a store-ready listing</h2>
<p class="sub">No design skills required. No subscriptions. Just your screenshots and a browser.</p>
<div class="grid3">${features}</div></section>

<section class="wrap section"><h2>How it works</h2><div class="grid3">${steps}</div></section>

<section class="wrap section" id="devices"><h2>One studio, every store</h2>
<p class="sub">Each canvas matches its store's required size exactly — pick your device and start designing.</p>
<div class="grid3">${devices}</div></section>

<section class="wrap section"><h2>Frequently asked questions</h2>${faqBlock(HOME_FAQS)}</section>

<section class="cta-band"><div class="wrap">
  <h2>Your listing deserves better screenshots.</h2>
  <p>Open the studio and design your first set in minutes — free.</p>
  <a class="btn btn-primary btn-lg" href="/generator/">Open the Studio</a>
</div></section>`;
  return layout({
    title: "Creestion — Free App Store Screenshot Maker for iPhone, Android, iPad, Mac & Windows",
    description:
      "Design beautiful app store screenshots in minutes. Free manual studio with exact-size canvases for iPhone, iPad, Android, Mac, and Windows. No signup, no watermark.",
    path: "",
    ogImage: "/screenshots/hero-studio.png",
    jsonLd: [orgSchema, appSchema, faqSchema(HOME_FAQS)],
    active: "home",
    body,
  });
}

/* ---------------- Device page ---------------- */

export function devicePage(d) {
  const specRows = [
    ["Canvas size", d.canvas],
    ["Device", d.deviceLabel],
    ["Aspect ratio", d.aspect],
    ["Store", d.store],
    ["Screenshots per listing", d.maxShots],
    ["Export format", d.formats],
  ]
    .map((r) => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`)
    .join("");
  const gallery = d.gallery
    .map((g, i) => `<img src="${g}" alt="${d.name} screenshot example ${i + 1} made with Creestion" loading="lazy" width="540" height="960">`)
    .join("");
  const related = DEVICES.filter((x) => x.key !== d.key)
    .map((x) => `<a href="/${x.path}/">${x.name}</a>`)
    .join(" · ");
  const body = `
<section class="wrap page-head">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/#devices">Devices</a> / <span>${d.name}</span></nav>
  <h1>${esc(d.h1)}</h1>
  <p class="lede">${esc(d.intro)}</p>
  <div class="cta-row"><a class="btn btn-primary" href="/generator/#${d.hash}">Open ${d.name} canvas</a></div>
</section>
<section class="wrap section"><h2>${d.store} requirements, handled</h2>
<table class="specs"><tbody>${specRows}</tbody></table></section>
<section class="wrap section"><h2>Examples</h2><div class="gallery">${gallery}</div></section>
<section class="wrap section"><h2>How to make ${d.name} screenshots</h2>
<div class="grid3">${STEPS.map((s, i) => `<div class="card step"><span class="step-n">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div>`).join("")}</div>
<div class="cta-row" style="margin-top:1.5rem"><a class="btn btn-primary" href="/generator/#${d.hash}">Start designing — free</a></div></section>
<section class="wrap section"><h2>${d.name} FAQs</h2>${faqBlock(d.faqs)}</section>
<section class="wrap section"><h2>Other devices</h2><p class="related">${related}</p></section>`;
  return layout({
    title: d.title,
    description: d.description,
    path: d.path,
    ogImage: d.gallery[0],
    jsonLd: [
      orgSchema,
      { ...appSchema, name: `Creestion Studio for ${d.name}` },
      faqSchema(d.faqs),
      breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: "Devices", href: "/#devices" },
        { name: d.name, href: `/${d.path}/` },
      ]),
    ],
    active: "devices",
    body,
  });
}

/* ---------------- About / Privacy / Terms ---------------- */

export function aboutPage() {
  const body = `<section class="wrap page-head">
<h1>About Creestion</h1>
<p class="lede">Creestion is a free, manual screenshot studio for app makers. It started from a simple frustration: making store screenshots meant wrestling with design tools that were never built for exact store sizes — or paying for watermarked exports.</p>
</section>
<section class="wrap prose">
<h2>What it does</h2>
<p>Creestion gives you pixel-exact canvases for the iPhone App Store, iPad App Store, Google Play, Mac App Store, and Microsoft Store. Upload your app's screenshots, arrange scenes, rewrite headlines in place, and export full-resolution PNGs as a ZIP.</p>
<h2>How it's different</h2>
<p>Everything runs in your browser. There is no account, no server upload, and no watermark — your screenshots never leave your device. It's a tool, not a platform: open it, design, export, done.</p>
<h2>Who makes it</h2>
<p>Creestion is an independent project by <a href="https://dusrel.com">Dus Mamud</a>. If it saves you an afternoon, that's the whole point.</p>
<div class="cta-row"><a class="btn btn-primary" href="/generator/">Open the Studio</a></div>
</section>`;
  return layout({
    title: "About — Creestion",
    description: "Creestion is a free manual screenshot studio for app makers. No account, no uploads, no watermark — design in your browser.",
    path: "about",
    ogImage: "/screenshots/hero-studio.png",
    jsonLd: [orgSchema],
    active: "about",
    body,
  });
}

export function privacyPage() {
  const body = `<section class="wrap page-head"><h1>Privacy Policy</h1><p class="lede">Short version: Creestion collects nothing.</p></section>
<section class="wrap prose">
<h2>Your screenshots stay yours</h2>
<p>The studio runs entirely in your browser. Screenshots you upload are processed locally and never sent to any server. There is no account system and nothing to delete.</p>
<h2>Analytics</h2>
<p>This site may use privacy-friendly, cookieless analytics to understand aggregate usage. No personal data is collected, sold, or shared.</p>
<h2>Contact</h2>
<p>Questions about privacy: reach out via <a href="https://dusrel.com">dusrel.com</a>.</p>
</section>`;
  return layout({
    title: "Privacy Policy — Creestion",
    description: "Creestion collects nothing. The studio runs entirely in your browser.",
    path: "privacy",
    ogImage: "/screenshots/hero-studio.png",
    jsonLd: [orgSchema],
    body,
  });
}

export function termsPage() {
  const body = `<section class="wrap page-head"><h1>Terms of Use</h1></section>
<section class="wrap prose">
<h2>The tool</h2>
<p>Creestion is provided free of charge, as-is, for designing app store screenshots. Exports carry no watermark and no license restrictions from us — your designs are yours.</p>
<h2>Fair use</h2>
<p>Don't use the studio to misrepresent apps, infringe trademarks, or violate any app store's policies. You're responsible for what you publish.</p>
<h2>Changes</h2>
<p>Features may change over time. We'll keep the core studio free.</p>
</section>`;
  return layout({
    title: "Terms of Use — Creestion",
    description: "Terms of use for Creestion's free screenshot studio.",
    path: "terms",
    ogImage: "/screenshots/hero-studio.png",
    jsonLd: [orgSchema],
    body,
  });
}

/* ---------------- sitemap / robots / llms.txt ---------------- */

export function sitemapXml(pages) {
  const urls = pages
    .map((p) => `  <url><loc>${SITE.domain}/${p}</loc><changefreq>weekly</changefreq><priority>${p === "" ? "1.0" : p.startsWith("generator/") && p.split("/").length === 2 ? "0.9" : "0.8"}</priority></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export function robotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml`;
}

export function llmsTxt() {
  const deviceLines = DEVICES.map((d) => `- ${d.name} (${d.store}, ${d.canvas}): ${SITE.domain}/${d.path}/`).join("\n");
  return `# Creestion\n\n> ${SITE.tagline}\n\nCreestion is a free, manual screenshot studio for app store listings. It runs entirely in the browser: upload app screenshots, arrange them on exact-size store canvases, edit headlines in place, and export full-resolution PNGs. No signup, no watermark, no server uploads.\n\n## Studio\n\n- Open the studio: ${SITE.domain}/generator/\n\n## Device guides\n\n${deviceLines}\n\n## Pages\n\n- About: ${SITE.domain}/about/\n- Privacy: ${SITE.domain}/privacy/\n- Terms: ${SITE.domain}/terms/\n`;
}
