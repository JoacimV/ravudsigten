// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3000,
  },
  site: 'https://ravudsigten.dk',
  integrations: [react(), sitemap()]
});