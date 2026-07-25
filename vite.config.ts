import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

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