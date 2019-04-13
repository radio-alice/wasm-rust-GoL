const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');
const express = require('express');

module.exports = {
  entry: "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js"
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin(['index.html'])
  ],
  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    contentBase: path.join(__dirname, ''),
    compress: true,
    setup (app) {
      app.use('/gol',
        express.static(path.join(__dirname, '')));
    }
  }
};