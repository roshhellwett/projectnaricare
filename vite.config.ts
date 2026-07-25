import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => {
  const plugins = [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: {
        entry: "server",
      },
    }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5000000
      },
      manifest: {
        name: 'NariCare',
        short_name: 'NariCare',
        description: 'Privacy-first cycle and health tracker.',
        theme_color: '#1a1515',
        background_color: '#1a1515',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
  ];

  if (command === "build") {
    plugins.push(
      nitro({
        // Use Vercel preset only when building for Vercel (VERCEL=1 or NITRO_PRESET set).
        preset: process.env.NITRO_PRESET || (process.env.VERCEL ? "vercel" : undefined),
      })
    );
  }

  return {
    plugins,
    resolve: {
      dedupe: ["react", "react-dom", "@tanstack/react-router"],
    },
    ssr: {
      noExternal: ["recharts", "lucide-react", "tslib"],
    },
  };
});