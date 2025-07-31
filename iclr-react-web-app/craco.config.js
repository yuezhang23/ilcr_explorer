const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Fix for fs.F_OK deprecation warning
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };

      // Update webpack-dev-server configuration to use new middleware API
      if (env === 'development') {
        webpackConfig.devServer = {
          ...webpackConfig.devServer,
          setupMiddlewares: (middlewares, devServer) => {
            // This replaces the deprecated onBeforeSetupMiddleware and onAfterSetupMiddleware
            return middlewares;
          },
        };
      }

      return webpackConfig;
    },
  },
  devServer: {
    // Modern webpack-dev-server configuration
    setupMiddlewares: (middlewares, devServer) => {
      return middlewares;
    },
  },
}; 