import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Status Legend Colors as per AGENTS.md
        status: {
          notified: "#2563eb",       // Blue
          assessment: "#d97706",     // Amber
          compensation: "#16a34a",   // Green
          possession: "#7c3aed",     // Purple
          delayed: "#dc2626",        // Red
        },
      },
    },
  },
  plugins: [],
};
export default config;
