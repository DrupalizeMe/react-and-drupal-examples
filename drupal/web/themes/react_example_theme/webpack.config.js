const path = require('path');
const WriteFilePlugin = require('write-file-webpack-plugin');

const isDevMode = process.env.NODE_ENV !== 'production';

const PROXY = 'https://react-tutorials-2.ddev.site/';
const PUBLIC_PATH = '/themes/react_example_theme/js/dist_dev/';

const config = {
  entry: {
    main: [
      "react-hot-loader/patch",
      "./js/src/index.jsx"
    ]
  },
  devtool: (isDevMode) ? 'source-map' : false,
  mode: (isDevMode) ? 'development' : 'production',
  output: {
    path: isDevMode ? path.resolve(__dirname, "js/dist_dev") : path.resolve(__dirname, "js/dist"),
    filename: '[name].min.js',
    publicPath: PUBLIC_PATH
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: path.join(__dirname, 'js/src'),
        options: {
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true,
          plugins: ['react-hot-loader/babel'],
        },
      }
    ],
  },
  plugins: [
    new WriteFilePlugin({
      force: true,
      test: /^(?!.*(hot)).*/,
    })
  ],
  devServer: {
    port: 8181,
    hot: true,
    https: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    proxy: {
      '/': {
        index: '',
        context: () => true,
        target: PROXY,
        publicPath: PUBLIC_PATH,
        secure: false,
        changeOrigin: true,
        xfwd: true
      }
    }
  },
};

module.exports = config;
