/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(99 102 241)',
        secondary: 'rgb(139 92 246)', 
        accent: 'rgb(59 130 246)',
        success: 'rgb(34 197 94)',
        warning: 'rgb(251 191 36)',
        error: 'rgb(239 68 68)',
        lightBlue: '#EDECFC',
        darkPurple: '#4F46E5',
        lightGrey: '#F2F2F2',
        lightBrown: '#756464',
        lightPurple: '#F0EFFF',
      },
      fontFamily: {
        sans: ['Manrope', 'Nunito', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};
