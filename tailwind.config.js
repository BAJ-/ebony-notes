module.exports = {
  corePlugins: {
   outline: false,
  },
  purge: [],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [
    require('@tailwindcss/custom-forms')
  ],
  future: {
    removeDeprecatedGapUtilities: true
  }
}
