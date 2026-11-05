// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages build (`bun run build:pages`): static, prerendered HTML served from
// /<repo>/, with no server. Every other build keeps Lovable's default Cloudflare setup.
const pagesBase = process.env["PAGES_BASE"];

export default defineConfig(
  pagesBase
    ? {
        vite: { base: pagesBase },
        nitro: false,
        tanstackStart: {
          server: { entry: "server" },
          router: { basepath: pagesBase },
          prerender: { enabled: true, crawlLinks: false },
        },
      }
    : {
        tanstackStart: {
          // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
          // nitro/vite builds from this
          server: { entry: "server" },
        },
      },
);
