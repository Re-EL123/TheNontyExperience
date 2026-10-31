import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Built straight into the API project so one Vercel deployment serves both (same origin = simple cookies).
  build: { outDir: "../api/dist", emptyOutDir: true },
  server: { port: 5173, proxy: { "/api": "http://localhost:8787" } },
});
