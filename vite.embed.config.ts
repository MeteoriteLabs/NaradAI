import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist/widget",
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, "client/embed/embed.ts"),
      formats: ["iife"],
      name: "NaradaEmbed",
      fileName: () => "embed.js",
    },
  },
});
