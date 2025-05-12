module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#121212',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // Set Roboto as the default sans-serif font
      },
    },
  },
  plugins: [],
}
