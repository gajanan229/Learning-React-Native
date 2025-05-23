/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base dark theme colors
        background: {
          DEFAULT: '#121212',
          secondary: '#1A1A1A',
          tertiary: '#222222'
        },
        foreground: {
          DEFAULT: '#EEEEEE',
          secondary: '#B0B0B0',
          tertiary: '#787878'
        },
        // Electric blue accent color
        accent: {
          DEFAULT: '#2D88FF',
          light: '#4A9DFF',
          dark: '#1A6FE0'
        },
        // Status colors
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336'
      }
    },
  },
  plugins: [],
};