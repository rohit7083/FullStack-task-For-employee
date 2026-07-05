/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12131A",
        paper: "#F4F6F8",
        panel: "#FFFFFF",
        border: "#E2E6EB",
        muted: "#6B7280",
        brand: {
          DEFAULT: "#2C5FF6",
          dark: "#1E46C7",
          light: "#EAF0FF",
        },
        priority: {
          low: "#1F9D63",
          medium: "#F5A524",
          high: "#E5484D",
        },
        status: {
          pending: "#6B7280",
          progress: "#2C5FF6",
          completed: "#1F9D63",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
