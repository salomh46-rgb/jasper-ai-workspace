/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tg: {
          bg: '#17212b',
          surface: '#242f3d',
          surfaceHover: '#2b394a',
          primary: '#2481cc',
          primaryHover: '#1c6ca8',
          accent: '#00c853',
          text: '#f5f5f5',
          textSecondary: '#8a9aa8',
          border: '#313d4f'
        }
      }
    },
  },
  plugins: [],
}
