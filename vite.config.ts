import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // The server bundle runs as a Cloudflare Worker: there is no node_modules at
  // runtime, so every npm dependency is bundled in. `cloudflare:*` modules are
  // runtime built-ins and stay external.
  ssr: {
    noExternal: true,
    external: ["cloudflare:workers"],
  },
  build: {
    rollupOptions: { external: [/^cloudflare:/] },
  },
  plugins: [
    // `vite build` emits dist/server/server.js (`export default { fetch }`) for
    // the Worker and dist/client for static assets (see wrangler.jsonc).
    tanstackStart({ server: { entry: "server" } }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
