/**
 * Static marketing site generator for Creestion.
 *
 * Runs after `vite build`. Moves the React studio's index.html to
 * /generator/, then writes static SEO pages (landing, device guides,
 * about, legal) plus sitemap.xml, robots.txt, and llms.txt into dist/.
 *
 * Usage: node scripts/build-pages.mjs   (cwd = repo root)
 */
import { mkdirSync, writeFileSync, renameSync, copyFileSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEVICES } from "./site/data.mjs";
import {
  homePage,
  devicePage,
  aboutPage,
  privacyPage,
  termsPage,
  sitemapXml,
  robotsTxt,
  llmsTxt,
} from "./site/templates.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

if (!existsSync(join(dist, "index.html"))) {
  console.error("build-pages: dist/index.html missing — run vite build first");
  process.exit(1);
}

const write = (rel, content) => {
  const full = join(dist, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  console.log("wrote", rel, `(${(content.length / 1024).toFixed(1)}kb)`);
};

// 1. Move the React studio under /generator/
mkdirSync(join(dist, "generator"), { recursive: true });
if (existsSync(join(dist, "generator", "index.html"))) rmSync(join(dist, "generator", "index.html"));
renameSync(join(dist, "index.html"), join(dist, "generator", "index.html"));
console.log("moved app index.html -> generator/index.html");

// 2. Stylesheet
copyFileSync(join(root, "scripts", "site", "styles.css"), join(dist, "styles.css"));
console.log("wrote styles.css");

// 3. Pages
const sitemapPaths = ["", "generator/"];
write("index.html", homePage());
for (const d of DEVICES) {
  write(`${d.path}/index.html`, devicePage(d));
  sitemapPaths.push(`${d.path}/`);
}
write("about/index.html", aboutPage());
sitemapPaths.push("about/");
write("privacy/index.html", privacyPage());
sitemapPaths.push("privacy/");
write("terms/index.html", termsPage());
sitemapPaths.push("terms/");

// 4. SEO plumbing
write("sitemap.xml", sitemapXml(sitemapPaths));
write("robots.txt", robotsTxt());
write("llms.txt", llmsTxt());

console.log("done:", sitemapPaths.length, "pages");
