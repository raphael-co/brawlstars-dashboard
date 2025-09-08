
import type { Config } from 'tailwindcss'
export default {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: { '2xl': '1rem' },
      boxShadow: { soft: '0 8px 24px rgba(0,0,0,0.12)' }
    },
  },
  plugins: [],
} satisfies Config
