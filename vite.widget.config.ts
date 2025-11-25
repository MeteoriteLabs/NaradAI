import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/widget",
    lib: {
      entry: path.resolve(__dirname, "client/widget-entry.tsx"),
      formats: ["iife"],
      name: "NaradaWidget",
      fileName: () => "widget.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "widget.[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
