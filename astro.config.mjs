// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  devToolbar: {
    enabled: false
  },

  integrations: [react()],
  prefetch: false,
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    }
  }),
  output: "server",
  session: {
    driver: "mongodb",
    options: {
      connectionString: import.meta.env.MONGODB_URI,
      databaseName: import.meta.env.MONGODB_DB_NAME,
    }
  }
});