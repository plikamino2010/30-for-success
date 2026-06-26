/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm paper tones — replaces cool blue-gray with earthy cream/brown
        slate: {
          50:  '#FAF6EE',
          100: '#F2EAD5',
          200: '#E2D1B0',
          300: '#CCAE85',
          400: '#B08B62',
          500: '#8E6C47',
          600: '#6E5033',
          700: '#503A23',
          800: '#352718',
          900: '#1E160E',
          950: '#100C08',
        },
        // Dusty violet primary — watercolor-ink feel
        brand: {
          50:  '#F2EDFF',
          100: '#E4D9FF',
          200: '#C9B4FF',
          300: '#A888F0',
          400: '#8B6CC8',
          500: '#7755BB',
          600: '#6040A8',
          700: '#4D308A',
        },
      },
      boxShadow: {
        card: '4px 5px 0px rgba(109,80,200,0.18), 0 2px 18px rgba(80,50,10,0.08)',
        soft: '2px 3px 0px rgba(80,50,10,0.14)',
      },
      fontFamily: {
        sans: ['Itim', 'Noto Sans Thai', 'Sarabun', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
