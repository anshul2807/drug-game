/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        hud: ['"Chakra Petch"', 'monospace', 'sans-serif'],
        retro: ['"VT323"', 'monospace'],
        sans: ['"Inter"', 'sans-serif']
      },
      colors: {
        neon: {
          green: '#10b981',
          amber: '#f59e0b',
          cyan: '#06b6d4',
          red: '#ef4444',
          purple: '#a855f7'
        }
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.35)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.35)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.45)',
        'glow-purple': '0 0 15px rgba(168, 85, 247, 0.35)',
      }
    },
  },
  plugins: [],
}
