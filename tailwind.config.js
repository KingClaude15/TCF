/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec5ff',
          400: '#59a5ff',
          500: '#3182f6',
          600: '#1c63e0',
          700: '#184fb5',
          800: '#194391',
          900: '#1a3a75',
          950: '#132449',
        },
        ink: {
          50: '#f4f6fa',
          100: '#e6eaf2',
          200: '#c7d0e0',
          300: '#9aabc7',
          400: '#67809f',
          500: '#485f81',
          600: '#374a66',
          700: '#293851',
          800: '#0f1b30',
          900: '#0a1424',
          950: '#060c17',
        },
        gold: {
          50: '#fdf8ec',
          100: '#faedc7',
          200: '#f4da8f',
          300: '#edc253',
          400: '#e6ac2e',
          500: '#d0921c',
          600: '#ab7115',
          700: '#875616',
          800: '#6f4518',
          900: '#5f3b19',
        },
        co: { light: '#e0f2fe', DEFAULT: '#0ea5e9', dark: '#0369a1' },
        ce: { light: '#ede9fe', DEFAULT: '#8b5cf6', dark: '#6d28d9' },
        ee: { light: '#fce7f3', DEFAULT: '#ec4899', dark: '#be185d' },
        surface: {
          light: '#ffffff',
          DEFAULT: '#f8fafc',
          dark: '#0f172a',
          darkCard: '#1e293b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Lexend', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pop: { '0%': { transform: 'scale(0.95)' }, '100%': { transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out',
        pop: 'pop 0.2s ease-out',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        cardHover: '0 12px 28px -6px rgba(15,23,42,0.14)',
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 40px -12px rgba(10,20,36,0.45)',
      },
      backgroundImage: {
        'grid-faint': 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
