/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0b1f16',
          900: '#123524',
          800: '#1b4d35',
          700: '#2a6a49',
        },
        gold: {
          500: '#D4AF37',
          400: '#e8c76a',
        },
      },
      boxShadow: {
        reverent: '0 10px 40px rgba(18, 53, 36, 0.25)',
      },
      fontFamily: {
        display: ['"Merriweather"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
