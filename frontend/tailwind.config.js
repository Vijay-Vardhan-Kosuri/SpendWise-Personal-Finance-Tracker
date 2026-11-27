/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#ECFDF5",
          100: "#DCFCE7",
          200: "#BBF7D0",
          500: "#059669",
          600: "#047857",
          700: "#166534",
          800: "#14532D",
          900: "#0F3D2E",
        },
        warm: {
          50: "#FAF9F6",
          100: "#F4F2EC",
          200: "#E8E5DC",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 61, 46, 0.06), 0 1px 2px -1px rgba(15, 61, 46, 0.04)",
        elevated: "0 10px 25px -5px rgba(15, 61, 46, 0.08), 0 8px 10px -6px rgba(15, 61, 46, 0.04)",
      },
    },
  },
  plugins: [],
};
