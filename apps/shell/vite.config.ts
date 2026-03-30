import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const chatRemoteUrl =
    env.VITE_CHAT_REMOTE_URL || "http://localhost:4174/assets/remoteEntry.js";
  const coachingRemoteUrl =
    env.VITE_COACHING_REMOTE_URL ||
    "http://localhost:4175/assets/remoteEntry.js";

  return {
    optimizeDeps: {
      include: ["@tanstack/react-query", "axios"],
    },
    plugins: [
      react(),
      federation({
        name: "shell",
        remotes: {
          chatApp: chatRemoteUrl,
          coachingApp: coachingRemoteUrl,
        },
        shared: ["react", "react-dom", "react-router-dom"],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "esnext",
    },
  };
});
