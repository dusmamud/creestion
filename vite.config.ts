import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const SRC_DIR = new URL("./src", import.meta.url).pathname;

/**
 * Creestion web is a pure client-side app: no API, no server. Everything
 * (state, uploads, rendering, export) runs in the browser; the build output
 * is static and can be hosted on any static host (e.g. Cloudflare Pages).
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": SRC_DIR } },
  server: { port: 4321, open: true },
});
