const path = require("path");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const { babel } = require("@rollup/plugin-babel");
const { terser } = require("rollup-plugin-terser");
const peerDepsExternal = require("rollup-plugin-peer-deps-external");
const postcss = require("rollup-plugin-postcss");
const image = require("@rollup/plugin-image");
const alias = require("@rollup/plugin-alias");
const dts = require("rollup-plugin-dts").default;
const json = require("@rollup/plugin-json");
const replace = require("@rollup/plugin-replace");
const dotenv = require("dotenv");

dotenv.config();

const env = {};
Object.keys(process.env).forEach((key) => {
  if (key.startsWith("REACT_APP_")) {
    env[`process.env.${key}`] = JSON.stringify(process.env[key]);
  }
});

env["process.env.NODE_ENV"] = JSON.stringify(process.env.NODE_ENV || "production");

const config = [
  // JS/TS bundle
  {
    input: "src/plugins/index.ts",
    output: [
      {
        file: "dist/flash.cjs.js",
        format: "cjs",
        sourcemap: "inline",
        name: "flash",
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "date-fns": "dateFns",
          "react/jsx-runtime": "jsxRuntime",
        },
        // This banner will be added to the top of the file
        banner: "// This file is generated by rollup",
        intro: "",
      },
      {
        file: "dist/flash.esm.js",
        format: "esm",
        sourcemap: "inline",
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "date-fns": "dateFns",
          "react/jsx-runtime": "jsxRuntime",
        },
        // This banner will be added to the top of the file
        banner: "// This file is generated by rollup",
        intro: "",
      },
    ],
    plugins: [
      peerDepsExternal(),
      replace({
        preventAssignment: true,
        values: {
          ...env,
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
        },
      }),
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      resolve({
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        browser: true,
      }),
      json(),
      commonjs({
        include: /node_modules/,
        transformMixedEsModules: true,
        circular: true,
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        exclude: ["**/__tests__/**", "**/*.test.tsx", "**/*.stories.tsx"],
        rootDir: "./src/plugins",
        declaration: true,
        declarationDir: "./dist",
        sourceMap: true,
        inlineSources: true,
        include: ["src/plugins/**/*"],
        jsx: "react",
        outDir: "./dist",
      }),
      babel({
        exclude: "node_modules/**",
        babelHelpers: "bundled",
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
      }),
      postcss({
        config: {
          path: "./postcss.config.js",
        },
        extensions: [".css"],
        extract: "flash.css",
        minimize: true,
        modules: false,
        plugins: [
          require("tailwindcss")({
            config: "./tailwind.config.js",
          }),
          require("autoprefixer"),
        ],
      }),
      image(),
      terser(),
    ],
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "buffer",
      "url",
      "@emotion/is-prop-valid",
      "date-fns",
      "react-router-dom",
      "motion",
    ],
  },
  // Type definitions
  {
    input: "src/plugins/index.ts",
    output: [{ file: "dist/flash.d.ts", format: "es" }],
    plugins: [
      replace({
        preventAssignment: true,
        values: env,
      }),
      dts({
        respectExternal: true,
        compilerOptions: {
          skipLibCheck: true,
        },
      }),
    ],
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "buffer",
      "url",
      "@emotion/is-prop-valid",
      "date-fns",
      "react-router-dom",
      "motion",
      /\.css$/,
    ],
  },
];

module.exports = config;
