/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paw: {
          50: '#f0fdf8',
          100: '#d9f7ea',
          200: '#b3ecd4',
          300: '#7dd9b5',
          400: '#42c08f',
          500: '#1fa774',
          600: '#12875e',
          700: '#116b4d',
          800: '#125640',
          900: '#114736',
        },
        warm: {
          50: '#fff8f1',
          100: '#feecdc',
          200: '#fcd5bd',
          300: '#f9b48a',
          400: '#f4864a',
          500: '#ef6820',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
