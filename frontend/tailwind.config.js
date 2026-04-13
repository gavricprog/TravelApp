/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgb(15 23 42 / 0.08), 0 8px 16px -8px rgb(15 23 42 / 0.06)',
        glow: '0 0 0 1px rgb(45 212 191 / 0.2), 0 12px 40px -12px rgb(13 148 136 / 0.35)',
      },
    },
  },
  plugins: [],
};
