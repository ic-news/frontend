const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig, { env }) => {
      // Disable source maps in production
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.devtool = false;
      }

      // Configure source map handling
      if (process.env.NODE_ENV === 'production') {
        // Disable source maps for specific packages in production
        webpackConfig.module.rules.push({
          test: /node_modules\/simple-cbor/,
          enforce: 'pre',
          loader: 'source-map-loader',
          options: {
            filterSourceMappingUrl: (url, resourcePath) => {
              return false; // Always ignore source maps for simple-cbor
            }
          }
        });
      } else {
        // In development, still load source maps but exclude problematic packages
        webpackConfig.module.rules.push({
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
          resolve: {
            fullySpecified: false
          },
          exclude: [
            /node_modules\/simple-cbor/,
          ]
        });
      }

      if (process.env.NODE_ENV === "production") {
        // Enable module concatenation for better tree shaking
        webpackConfig.optimization.concatenateModules = true;

        // Increase the minimum chunk size for better code splitting
        webpackConfig.optimization.splitChunks = {
          chunks: "all",
          minSize: 20000,
          maxSize: 100000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        };

        // Enable module scope hoisting
        webpackConfig.optimization.moduleIds = "deterministic";
      }
      return webpackConfig;
    },
  },
  // Configure Babel options
  babel: {
    sourceMaps: process.env.NODE_ENV !== 'production',
    plugins: [
      ["@babel/plugin-transform-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }],
      "@babel/plugin-transform-optional-chaining",
      "@babel/plugin-transform-nullish-coalescing-operator",
    ],
  },
};
