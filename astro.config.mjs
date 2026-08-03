// @ts-check
import { defineConfig } from 'astro/config';
import { paraglide } from "@inlang/paraglide-js-adapter-vite";
import react from '@astrojs/react';
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import node from "@astrojs/node";

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3000,
  },
  site: 'https://ravudsigten.dk',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [paraglideVitePlugin({ project: './project.inlang', outdir: './src/paraglide' })],
  },
  output: 'server',
  adapter: node({ mode: "standalone" }),
});