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
      // Ignore source maps for problematic packages in both development and production
      webpackConfig.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        use: [
          {
            loader: 'source-map-loader',
            options: {
              filterSourceMappingUrl: (url, resourcePath) => {
                // Ignore source maps for simple-cbor package
                if (resourcePath.includes('node_modules/simple-cbor') ||
                    resourcePath.includes('node_modules/.pnpm/simple-cbor')) {
                  return false;
                }
                return true;
              }
            }
          }
        ],
        resolve: {
          fullySpecified: false
        }
      });

      // Explicitly ignore warnings from specific modules
      webpackConfig.ignoreWarnings = [
        // Ignore warnings about missing source maps for simple-cbor
        function ignoreSourceMapWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource &&
            (
              warning.module.resource.includes('node_modules/simple-cbor') ||
              warning.module.resource.includes('node_modules/.pnpm/simple-cbor')
            )
          );
        }
      ];

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
