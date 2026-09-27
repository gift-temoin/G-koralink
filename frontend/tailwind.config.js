/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kora: {
          50: '#e6f7f0',
          100: '#c2ebd9',
          200: '#99dfc0',
          300: '#6fd2a6',
          400: '#47c68d',
          500: '#00a86b', // Brand primary emerald
          600: '#008a57',
          700: '#006c43',
          800: '#004e30',
          900: '#00311d',
        },
        rwanda: {
          blue: '#00A3E0',
          yellow: '#FAD201',
          green: '#20603D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
