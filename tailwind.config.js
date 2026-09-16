/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bee: {
          50: '#FFFDF5',
          100: '#FEF9E7',
          200: '#FDF0C5',
          300: '#FCE39E',
          400: '#F9CF67',
          500: '#F5B01E', // vibrant honey
          600: '#E89218', // reference image amber orange
          700: '#C7700D',
          800: '#9E540E',
          900: '#7E430F',
        },
        navy: {
          950: '#070B14',
          900: '#0B1020',
          850: '#11172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        brandBlue: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          500: '#1677FF',
          600: '#147BFF',
          700: '#0A5CD6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(11, 16, 32, 0.04), 0 1px 3px rgba(11, 16, 32, 0.02)',
        'card': '0 10px 30px -5px rgba(11, 16, 32, 0.06), 0 4px 10px -2px rgba(11, 16, 32, 0.03)',
        'card-hover': '0 16px 36px -6px rgba(11, 16, 32, 0.09), 0 6px 14px -3px rgba(11, 16, 32, 0.04)',
        'modal': '0 24px 60px -12px rgba(11, 16, 32, 0.22)',
        'cta': '0 8px 24px -4px rgba(232, 146, 24, 0.35)',
        'cta-blue': '0 8px 24px -4px rgba(20, 123, 255, 0.35)',
      },
      borderRadius: {
        '26': '26px',
        '28': '28px',
        '32': '32px',
      }
    },
  },
  plugins: [],
}
