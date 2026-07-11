import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    cloudflare({
      configPath: mode === "devlocal" ? "./wrangler.local.jsonc" : "./wrangler.jsonc",
    }),
  ],
}));
