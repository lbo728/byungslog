import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import netlify from "@astrojs/netlify";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://byungsker.netlify.app/",
  prefetch: {
    prefetchAll: true,
    // defaultStrategy: "tap",
  },
  integrations: [preact(), tailwind()],
  adapter: netlify(),
});
