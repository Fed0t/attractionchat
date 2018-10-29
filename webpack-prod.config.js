const path = require("path");
// const webpack = require("webpack");
const bundlePath = path.resolve(__dirname, "dist/");

module.exports = {
  entry: ["babel-polyfill", "./src/index.js"],
  module: {
    rules: [
      {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules|bower_components)/,
          loader: "babel-loader",
          options: {
              presets: ["@babel/preset-react","@babel/preset-env"],
              plugins: ["transform-class-properties"]
          }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|pdf)/,
        exclude: /(node_modules|bower_components)/,
        loader: "file-loader",
        options: {
          name: "/[name].[ext]",
          publicPath: 'assets/chat/images/'
        }
      }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
      path: path.resolve(__dirname, "dist/"),
      publicPath: "/dist/",
      filename: "bundle.js"
  },

  plugins: []
};
