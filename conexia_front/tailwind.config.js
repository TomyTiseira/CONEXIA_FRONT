/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",  // Asegurate de usar la ruta correcta
    "./app/**/*.{js,ts,jsx,tsx}",  // Si usás App Router
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
    },
  },
  plugins: [],
};
