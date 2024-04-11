const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/activities',
    createProxyMiddleware({
      target: 'http://localhost:3000', // backend server address
      changeOrigin: true,
    })
  );
};
