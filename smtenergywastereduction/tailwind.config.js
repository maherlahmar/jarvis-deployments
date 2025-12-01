/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef9ff',
          100: '#d9f1ff',
          200: '#bce6ff',
          300: '#8ed8ff',
          400: '#58c0ff',
          500: '#32a3ff',
          600: '#1a85f7',
          700: '#136de3',
          800: '#1658b8',
          900: '#184b91',
          950: '#132f58',
        },
        energy: {
          low: '#22c55e',
          medium: '#eab308',
          high: '#ef4444',
        },
        slate: {
          850: '#172033',
          950: '#0a0f1a',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
