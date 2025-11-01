/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",  
    "./app/**/*.{js,ts,jsx,tsx}",  // Para App Router
  ],
  theme: {
    extend: {
      colors: {
        conexia: {
          green: "#113B35",
          soft: "#D5EAE3",
          coral: "#BB3A3A",
        },
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathing: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        breathing: 'breathing 3s ease-in-out infinite',
        fadeIn: 'fadeIn 0.3s ease-out',
      },
      zIndex: {
        '45': '45',
      },
    },
  },
  plugins: [],
};
