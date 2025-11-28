/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // SharCRM Brand Colors - Bright Lime/Yellow Theme
        brand: {
          50: '#F7FFE5',
          100: '#EFFFCC',
          200: '#DEFF99',
          300: '#CCFF00', // Primary brand color (logo)
          400: '#B8E600',
          500: '#A3CC00',
          600: '#8FB300',
          700: '#7A9900',
          800: '#668000',
          900: '#526600',
        },
        accent: {
          50: '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFF59D',
          300: '#FFF176',
          400: '#FFEE58',
          500: '#FFEB3B',
          600: '#FDD835',
          700: '#FBC02D',
          800: '#F9A825',
          900: '#F57F17',
        }
      },
    },
  },
  plugins: [],
}
