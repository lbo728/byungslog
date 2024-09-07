import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  site: "https://byungsker.netlify.app/",
  prefetch: {
    prefetchAll: false,
  },
  integrations: [preact()],
  output: "hybrid",
  adapter: netlify(),
});
