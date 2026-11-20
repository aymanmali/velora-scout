import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          50: "#fdf4f8",
          100: "#fce8f3",
          200: "#fad1e7",
          300: "#f7add3",
          400: "#f179b5",
          500: "#e64893",
          600: "#d42b74",
          700: "#b81d5b",
          800: "#981b4c",
          900: "#7f1b42",
        },
      },
    },
  },
  plugins: [],
};

export default config;
