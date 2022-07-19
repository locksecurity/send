const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ["./src/**/*.vue", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'spin-brisk': 'spin .5s linear infinite'
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
