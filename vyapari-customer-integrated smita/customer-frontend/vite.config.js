import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev proxy: the browser talks only to Vite (http://localhost:5173),
// and Vite forwards API calls to the right backend. This avoids all
// CORS conflicts without touching any backend file.
//
//   /api/users/**              -> auth backend  (backend3)        on :8081
//   /api/delivery-personnel/** -> legacy seller backend (optional) on :8082
//   /api/**                    -> customer backend (com.ecom)     on :8080
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/users": {
        target: "http://localhost:8081",
        changeOrigin: true,
        // backend3's @CrossOrigin only allows localhost:3000; stripping the
        // Origin header makes the proxied request a plain same-origin request
        // so Spring's CORS check never rejects it.
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin"));
        },
      },
      "/api/delivery-personnel": {
        target: "http://localhost:8082",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
