/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — calm, accessible, autism-friendly
        primary: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#8193f8',
          500: '#6470f3',  // main brand
          600: '#5058e5',
          700: '#4146ca',
          800: '#373ca3',
          900: '#313581',
        },
        soft: {
          bg:      '#f8f9fe',   // page background
          card:    '#ffffff',
          border:  '#e8ecf8',
          muted:   '#9399b2',
        },
        decode: {
          literal:  '#3b82f6',  // blue  — literal meaning
          social:   '#8b5cf6',  // purple — social meaning
          tone:     '#f59e0b',  // amber  — emotional tone
          respond:  '#10b981',  // green  — suggested response
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error:   '#ef4444',
          info:    '#3b82f6',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card:   '0 2px 16px 0 rgba(100,112,243,0.08)',
        hover:  '0 8px 32px 0 rgba(100,112,243,0.16)',
        decode: '0 4px 24px 0 rgba(100,112,243,0.12)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
