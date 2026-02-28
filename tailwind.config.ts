import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clio: {
          blue: "#0070E0",
          "blue-dark": "#005BBB",
          "blue-light": "#E8F2FC",
          text: "#333333",
          "text-light": "#666666",
          bg: "#F5F7FA",
          border: "#D1D9E0",
          success: "#0D9B4A",
          "success-bg": "#E6F7ED",
          warning: "#E67E22",
          "warning-bg": "#FFF5EB",
          error: "#D63031",
        },
      },
    },
  },
  plugins: [],
};
export default config;
