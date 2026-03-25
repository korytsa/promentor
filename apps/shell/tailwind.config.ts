import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  important: true,
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
