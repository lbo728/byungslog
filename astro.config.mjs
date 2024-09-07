import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://byungsker.netlify.app/",
  prefetch: {
    prefetchAll: false,
  },
  integrations: [preact()],
  output: "hybrid",
  adapter: node({
    mode: "standalone",
  }),
});
