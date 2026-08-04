// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { paraglideVitePlugin } from "@inlang/paraglide-js";

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3000,
  },
  site: 'https://ravudsigten.dk',
  integrations: [react(), sitemap()],
  i18n: {
    defaultLocale: 'da',
    locales: ['da', 'en', 'sv', 'de'],
    routing: {
      prefixDefaultLocale: false // 'da' er på /, 'en' er på /en osv.
    }
  },
  vite: {
    plugins: [
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/paraglide',
        strategy: ['url', 'localStorage', 'cookie', 'baseLocale'],
      })
    ],
  }
});