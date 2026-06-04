import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          light: "#6D28D9", // ungu agak tua (light mode accent)
          dark: "#C4B5FD",  // ungu soft (dark mode accent)
        },
        bgsoft: {
          light: "#F8FAFC",
          dark: "#0B0B10",
        },
      },
    },
  },
  plugins: [],
};

export default config;
