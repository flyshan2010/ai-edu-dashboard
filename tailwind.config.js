/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#060b1c',
          800: '#0a1430',
          700: '#0f1d44',
          600: '#152552',
        },
        cyan: {
          glow: '#3dd9ff',
        },
        neon: {
          blue: '#3b82f6',
          cyan: '#22d3ee',
          violet: '#a855f7',
          green: '#34d399',
          amber: '#fbbf24',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(61, 217, 255, 0.35)',
        'glow-soft': '0 0 40px rgba(59, 130, 246, 0.25)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },
        gridmove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        spinSlow: 'spinSlow 18s linear infinite',
        gridmove: 'gridmove 6s linear infinite',
      },
    },
  },
  plugins: [],
}
