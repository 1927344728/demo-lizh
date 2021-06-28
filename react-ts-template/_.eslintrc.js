
module.exports = {
  'extends': [
    "react-app",
    "react-app/jest"
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 1,
  },
}