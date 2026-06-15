import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/codeforces": {
        target: "http://localhost:5001",
        changeOrigin: true
      },
      "/auth": {
        target: "http://localhost:5001",
        changeOrigin: true
      },
      "/leetcode": {
        target: "http://localhost:5001",
        changeOrigin: true
      },
      "/recommendations": {
        target: "http://localhost:5001",
        changeOrigin: true
      },
      "/discussions": {
        target: "http://localhost:5001",
        changeOrigin: true
      },
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true
      }
    }
  }
});
