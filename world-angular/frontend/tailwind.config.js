/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        space: {
          50: '#e6e7f0',
          100: '#b3b5d1',
          200: '#8083b3',
          300: '#4d5194',
          400: '#262a7d',
          500: '#000366',
          600: '#00025e',
          700: '#000253',
          800: '#000149',
          900: '#00003a',
          950: '#0a0a0f',
        },
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(to bottom, #000000, #0a0a0f, #1a1a2e)',
      },
    },
  },
  plugins: [],
};
