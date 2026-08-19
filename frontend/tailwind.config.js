/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables dark mode class support
  theme: {
    extend: {
      colors: {
        // Premium SaaS dark-themed slate-violet colors
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#0b0a0f', // deep dark
        },
        darkbg: {
          950: '#070709', // super dark void
          900: '#0f0f15', // cards, popups
          800: '#1a1a24', // inputs, panels
          700: '#2b2b36',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
