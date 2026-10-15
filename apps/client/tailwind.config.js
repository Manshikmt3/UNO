/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        uno: {
          red: '#ef4444',
          'red-dark': '#b91c1c',
          blue: '#3b82f6',
          'blue-dark': '#1d4ed8',
          green: '#10b981',
          'green-dark': '#047857',
          yellow: '#f59e0b',
          'yellow-dark': '#b45309',
          table: '#0f172a',
          'table-felt': '#1e293b',
          surface: '#182234',
        },
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.5)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.5)',
        'glow-yellow': '0 0 25px -5px rgba(245, 158, 11, 0.5)',
        card: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
