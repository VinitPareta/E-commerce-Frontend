import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const envApiUrl = process.env.VITE_API_URL;
  const proxyTarget = envApiUrl
    ? envApiUrl.replace(/\/api\/?$/, "")
    : "http://localhost:5001";

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  });
};
