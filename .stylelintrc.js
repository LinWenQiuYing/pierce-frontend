module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-prettier/recommended'
  ],
  plugins: [
    'stylelint-order',
    'stylelint-prettier',
  ],
  rules: {
    'prettier/prettier': true,
  },
}