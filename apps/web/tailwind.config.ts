import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b1220",
        card: "#0f172a",
        line: "#22304a",
        brand: "#7c3aed",
        brand2: "#06b6d4",
        muted: "#94a3b8",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,58,237,.25), 0 10px 30px rgba(0,0,0,.25)",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        fadeUp: "fadeUp .18s ease-out both",
      }
    },
  },
  plugins: [],
};

export default config;
