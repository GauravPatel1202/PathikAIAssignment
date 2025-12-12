/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        background: "#0f172a",
        card: "rgba(30, 41, 59, 0.4)",
        primary: "#3b82f6",
      }
    },
  },
  plugins: [],
}
