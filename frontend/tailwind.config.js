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
        canvas: {
          DEFAULT: '#07080D',
          subtle: '#0B0D14',
        },
        surface: {
          DEFAULT: '#0E121B',
          elevated: '#141A26',
          highlight: '#1C2333',
          glass: 'rgba(14, 18, 27, 0.75)',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.07)',
          hover: 'rgba(255, 255, 255, 0.14)',
          active: 'rgba(59, 130, 246, 0.4)',
        },
        brand: {
          DEFAULT: '#3B82F6',
          glow: '#60A5FA',
          dark: '#1D4ED8',
        },
        tg: {
          bg: '#07080D',
          surface: '#0E121B',
          surfaceHover: '#141A26',
          primary: '#3B82F6',
          primaryHover: '#2563EB',
          accent: '#10B981',
          text: '#F8FAFC',
          textSecondary: '#94A3B8',
          border: 'rgba(255, 255, 255, 0.08)'
        }
      },
      boxShadow: {
        'glow-blue': '0 0 25px -4px rgba(59, 130, 246, 0.4)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.4)',
        'glow-violet': '0 0 25px -4px rgba(139, 92, 246, 0.4)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        'glass-subtle': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'card-depth': '0 4px 24px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.07)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
