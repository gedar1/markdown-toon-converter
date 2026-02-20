/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "toast-slide-in": {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-live": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.6)" },
          "50%": { boxShadow: "0 0 0 8px rgba(239, 68, 68, 0)" },
        },
      },
      animation: {
        "toast-slide-in": "toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-live": "pulse-live 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
