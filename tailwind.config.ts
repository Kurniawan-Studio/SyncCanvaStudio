import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        narka: {
          dark: '#1C1C1C',
          light: '#F5F5F0',
          beige: '#D6C6B8',
          grey: '#6C6C6A',
          border: '#333333',
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        none: 'none',
      }
    },
  },
  plugins: [],
} satisfies Config;
