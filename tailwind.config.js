// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // <--- THIS LINE IS CRUCIAL FOR SCANNING REACT FILES
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}