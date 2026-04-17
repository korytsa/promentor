import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const chatRemoteUrl =
    env.VITE_CHAT_REMOTE_URL ||
    "https://promentor-chat.vercel.app/assets/remoteEntry.js";
  const coachingRemoteUrl =
    env.VITE_COACHING_REMOTE_URL ||
    "https://promentor-coaching.vercel.app/assets/remoteEntry.js";
  const apiTarget = (env.VITE_API_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  return {
    optimizeDeps: {
      include: ["@tanstack/react-query", "axios"],
    },
    plugins: [
      react(),
      federation({
        name: "shell",
        exposes: {
          "./authBridge": "./src/shared/auth/authBridge.ts",
        },
        remotes: {
          chatApp: chatRemoteUrl,
          coachingApp: coachingRemoteUrl,
        },
        shared: [
          "react",
          "react-dom",
          "react-router-dom",
          "@tanstack/react-query",
          "@promentorapp/ui-kit",
          "react-toastify",
        ],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      cors: true,
      proxy: {
        "/auth": { target: apiTarget, changeOrigin: true },
        "/users": { target: apiTarget, changeOrigin: true },
        "/rooms": { target: apiTarget, changeOrigin: true },
      },
    },
    preview: {
      port: 5173,
      strictPort: true,
      cors: true,
    },
    build: {
      target: "esnext",
    },
  };
});
