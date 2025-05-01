/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'colors.amber.500',
          ...require('tailwindcss/colors').amber
        },
        slate: require('tailwindcss/colors').slate,
      }
    },
  },
  plugins: [],
}
