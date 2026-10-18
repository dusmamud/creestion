/** Shared site data: devices, FAQs, navigation. */

export const SITE = {
  name: "Creestion",
  domain: "https://creestion.pages.dev",
  tagline: "App store screenshots, designed in minutes.",
};

export const DEVICES = [
  {
    key: "iphone",
    hash: "iphone",
    name: "iPhone",
    store: "Apple App Store",
    canvas: "1320 × 2868 px",
    deviceLabel: 'iPhone 6.9"',
    aspect: "19.5:9",
    maxShots: "10",
    formats: "PNG · JPEG",
    path: "generator/iphone",
    title: "iPhone App Store Screenshot Maker — Creestion",
    description:
      "Design iPhone App Store screenshots at the exact 1320×2868 canvas. Upload your app screens, edit headlines, export full-resolution PNGs — free, no signup.",
    h1: "iPhone App Store Screenshot Maker",
    intro:
      "Creestion builds pixel-perfect iPhone screenshots for your App Store listing. Start from the exact 1320×2868 canvas Apple expects for the 6.9-inch display, drop in your app screens, write headlines that sell, and export print-sharp PNGs.",
    gallery: ["/demo/ai-shot-1.png", "/demo/ai-shot-2.png", "/demo/ai-shot-3.png", "/demo/ai-shot-4.png"],
    faqs: [
      {
        q: "What size should iPhone App Store screenshots be?",
        a: "For the 6.9-inch display, Apple expects 1320×2868 px. Creestion's iPhone canvas is exactly that size, so what you design is what you upload — no resizing, no surprises.",
      },
      {
        q: "How many screenshots can I upload to the App Store?",
        a: "Apple allows up to 10 screenshots per device size. Creestion lets you design and reorder a full set of 10, then export them all at once as a ZIP.",
      },
      {
        q: "Do I need to create an account?",
        a: "No. Creestion runs entirely in your browser. Your screenshots never leave your device — there is no signup, no upload to a server, nothing to delete later.",
      },
    ],
  },
  {
    key: "ipad",
    hash: "ipad",
    name: "iPad",
    store: "Apple App Store",
    canvas: "2064 × 2752 px",
    deviceLabel: 'iPad 13"',
    aspect: "4:3",
    maxShots: "10",
    formats: "PNG · JPEG",
    path: "generator/ipad",
    title: "iPad App Store Screenshot Maker — Creestion",
    description:
      "Design iPad App Store screenshots at the exact 2064×2752 canvas. Upload screens, edit headlines, export full-resolution PNGs — free, no signup.",
    h1: "iPad App Store Screenshot Maker",
    intro:
      "Make your iPad listing look as good as your app. Creestion's iPad canvas matches the 13-inch App Store size of 2064×2752 px exactly — compose up to 10 screenshots with headlines and export them ready to upload.",
    gallery: ["/demo/ai-shot-2.png", "/demo/ai-shot-3.png", "/demo/ai-shot-5.png", "/demo/ai-shot-1.png"],
    faqs: [
      {
        q: "What size are iPad App Store screenshots?",
        a: "For the 13-inch iPad display, Apple expects 2064×2752 px. Creestion's iPad canvas is exactly that size.",
      },
      {
        q: "Can I reuse my iPhone screenshots for iPad?",
        a: "Apple requires separate iPad-sized assets — iPhone screenshots get rejected or look stretched. Design the iPad set on Creestion's exact-size canvas instead.",
      },
      {
        q: "Is Creestion really free?",
        a: "Yes. Every device canvas, template, and export is free with no account and no watermark.",
      },
    ],
  },
  {
    key: "android",
    hash: "android",
    name: "Android",
    store: "Google Play",
    canvas: "1080 × 1920 px",
    deviceLabel: "Play phone",
    aspect: "9:16",
    maxShots: "8",
    formats: "PNG · JPEG",
    path: "generator/android",
    title: "Google Play Screenshot Maker — Creestion",
    description:
      "Design Google Play screenshots at 1080×1920. Upload app screens, edit headlines, export full-resolution PNGs — free, no signup.",
    h1: "Google Play Screenshot Maker",
    intro:
      "Ship a Play Store listing that converts. Creestion's Android canvas is the 1080×1920 size Google Play asks for — add your screens, write benefit-led headlines, and export up to 8 screenshots in one ZIP.",
    gallery: ["/demo/ai-shot-3.png", "/demo/ai-shot-4.png", "/demo/ai-shot-1.png", "/demo/ai-shot-5.png"],
    faqs: [
      {
        q: "What size should Google Play screenshots be?",
        a: "Google Play asks for a minimum of 1080×1920 px (9:16). Creestion's Android canvas is exactly 1080×1920, and exports are full resolution.",
      },
      {
        q: "How many screenshots does Google Play allow?",
        a: "Up to 8 screenshots per listing. Design the full set in Creestion and export them together.",
      },
      {
        q: "Where do my uploaded screenshots go?",
        a: "Nowhere — everything happens locally in your browser. Creestion has no server, no account, and no upload queue.",
      },
    ],
  },
  {
    key: "mac",
    hash: "mac",
    name: "Mac",
    store: "Mac App Store",
    canvas: "2880 × 1800 px",
    deviceLabel: "16:10",
    aspect: "16:10",
    maxShots: "10",
    formats: "PNG · JPEG",
    path: "generator/mac",
    title: "Mac App Store Screenshot Maker — Creestion",
    description:
      "Design Mac App Store screenshots at 2880×1800 (16:10). Upload screens, edit headlines, export full-resolution PNGs — free, no signup.",
    h1: "Mac App Store Screenshot Maker",
    intro:
      "Desktop apps deserve desktop-grade listings. Creestion's Mac canvas is 2880×1800 — the largest 16:10 size the Mac App Store accepts — so your screenshots stay razor sharp on Retina displays.",
    gallery: ["/demo/desk-1.png", "/demo/desk-2.png", "/demo/desk-3.png", "/demo/desk-4.png"],
    faqs: [
      {
        q: "What size are Mac App Store screenshots?",
        a: "The Mac App Store accepts 16:10 screenshots — 1280×800, 1440×900, 2560×1600, and 2880×1800. Creestion uses 2880×1800, the largest, so your listing looks sharp everywhere.",
      },
      {
        q: "Do Mac screenshots need a device frame?",
        a: "No. Mac App Store screenshots are screen-only, full-bleed images — exactly what Creestion's Mac canvas produces.",
      },
      {
        q: "Can I use the same design for Windows?",
        a: "The content can match, but the canvas differs: Windows is 16:9 (3840×2160) while Mac is 16:10. Use Creestion's Windows page for the Microsoft Store set.",
      },
    ],
  },
  {
    key: "windows",
    hash: "windows",
    name: "Windows",
    store: "Microsoft Store",
    canvas: "3840 × 2160 px",
    deviceLabel: "16:9",
    aspect: "16:9",
    maxShots: "10",
    formats: "PNG",
    path: "generator/windows",
    title: "Microsoft Store Screenshot Maker — Creestion",
    description:
      "Design Microsoft Store screenshots at 3840×2160 4K (16:9). Upload screens, edit headlines, export full-resolution PNGs — free, no signup.",
    h1: "Microsoft Store Screenshot Maker",
    intro:
      "Make your Microsoft Store listing look 4K-sharp. Creestion's Windows canvas is 3840×2160 — full 4K at 16:9 — so your screenshots hold up on the biggest displays.",
    gallery: ["/demo/desk-3.png", "/demo/desk-4.png", "/demo/desk-5.png", "/demo/desk-1.png"],
    faqs: [
      {
        q: "What size are Microsoft Store screenshots?",
        a: "The Microsoft Store supports desktop screenshots from 1366×768 up to 4K 3840×2160. Creestion's Windows canvas is 3840×2160, so one design covers every display.",
      },
      {
        q: "What image format does the Microsoft Store want?",
        a: "PNG. Creestion exports every screenshot as a full-resolution PNG, zipped and ready to upload.",
      },
      {
        q: "Is there a watermark on exports?",
        a: "Never. Exports are clean, full-resolution PNGs with no watermark and no account required.",
      },
    ],
  },
];

export const HOME_FAQS = [
  {
    q: "What is Creestion?",
    a: "Creestion is a free, manual screenshot studio for app stores. Upload your app's screenshots, arrange them on exact-size store canvases, edit headlines and subheadings, and export full-resolution PNGs — all in your browser.",
  },
  {
    q: "Which stores and devices are supported?",
    a: "Five canvases: iPhone (App Store, 1320×2868), iPad (App Store, 2064×2752), Android (Google Play, 1080×1920), Mac (Mac App Store, 2880×1800), and Windows (Microsoft Store, 3840×2160).",
  },
  {
    q: "Is Creestion free? Do I need an account?",
    a: "Completely free, no account, no watermark. Everything runs locally in your browser — your screenshots are never uploaded to any server.",
  },
  {
    q: "What sizes do the exports come in?",
    a: "Exports are pixel-exact PNGs at each store's required canvas size — e.g. 1320×2868 for iPhone, 3840×2160 4K for Windows. Download one ZIP per device with every scene inside.",
  },
  {
    q: "Can I edit the text on my screenshots?",
    a: "Yes. Click any headline or subheading on a tile to edit it in place — Enter saves, Escape cancels. You can also drag layers to nudge their position.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. The studio is fully responsive — the settings live in a slide-in drawer and tiles are touch-friendly, so you can design from your phone too.",
  },
];

export const FEATURES = [
  { t: "Exact store canvases", d: "Pixel-perfect canvas sizes for the App Store, Google Play, Mac App Store, and Microsoft Store. What you design is what you upload.", img: "/screenshots/feat-1.png" },
  { t: "Upload your screens", d: "Drop in PNG screenshots per scene. Replace or delete anytime — your files stay in your browser, never on a server.", img: "/screenshots/feat-2.png" },
  { t: "Edit headlines in place", d: "Click any headline or subheading to rewrite it live on the tile. Drag layers to fine-tune the composition.", img: "/screenshots/feat-3.png" },
  { t: "Built-in templates", d: "Magazine-style layouts, fonts, backgrounds, and device frames included — or go frameless for desktop stores.", img: "/screenshots/feat-4.png" },
  { t: "One-click ZIP export", d: "Export every scene as a full-resolution PNG, zipped per device. No watermark, no account, no limits.", img: "/screenshots/feat-5.png" },
  { t: "Private by design", d: "No signup, no tracking pixels in the studio, no uploads. Your work never leaves your device.", img: "/screenshots/feat-6.png" },
];

export const STEPS = [
  { t: "Upload screenshots", d: "Add a scene per screenshot and drop in your app's PNGs — or start from the demo set." },
  { t: "Edit the design", d: "Pick a device canvas, choose a template, rewrite headlines in place, drag layers into place." },
  { t: "Export the set", d: "Download full-resolution PNGs as a ZIP, ready to upload to the store." },
];
