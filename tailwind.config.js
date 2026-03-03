/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-color': '#020617',
        'text-color': '#e4e4e4',
        'accent-color': '#38bdf8',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fadeUp': 'fadeUp 1s 2s forwards',
      },
      keyframes: {
        fadeUp: {
          'to': { opacity: '0.5' },
        }
      }
    },
  },
  plugins: [],
}