// Toma app.json y, solo al publicar en GitHub Pages, sirve la app desde /wasi-hero.
// Uso: npm run build:pages
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
