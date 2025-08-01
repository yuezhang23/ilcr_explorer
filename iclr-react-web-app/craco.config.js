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

      // Performance optimizations for development
      if (env === 'development') {
        // Use faster source maps for development
        webpackConfig.devtool = 'eval-cheap-module-source-map';
        
        // Optimize module resolution
        webpackConfig.resolve.modules = [
          'node_modules',
          path.resolve(__dirname, 'src'),
        ];

        // Add cache for faster rebuilds
        webpackConfig.cache = {
          type: 'filesystem',
          buildDependencies: {
            config: [__filename],
          },
        };

        // Optimize bundle splitting
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
              },
            },
          },
        };

        // Reduce bundle size by excluding unnecessary files
        webpackConfig.module.rules.push({
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        });

        // Update webpack-dev-server configuration to use new middleware API
        webpackConfig.devServer = {
          ...webpackConfig.devServer,
          setupMiddlewares: (middlewares, devServer) => {
            return middlewares;
          },
          // Performance optimizations for dev server
          hot: true,
          compress: true,
          client: {
            overlay: {
              errors: true,
              warnings: false,
            },
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