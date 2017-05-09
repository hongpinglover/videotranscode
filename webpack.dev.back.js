var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var devFlag = process.env.NODE_ENV == 'production'? false : 'source-map';
var publicPath = 'http://localhost:8088/';
var hotMiddleScript = 'webpack-hot-middleware/client?reload=true';

var config = {
    devtool : devFlag,
    entry : {
        index : [hotMiddleScript,path.join(__dirname,'/views_back/js/index.js')]
    },
    output : {
        path : '/',
        publicPath: publicPath,
        filename : '[name].js'
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new webpack.HotModuleReplacementPlugin()
    ]
}

module.exports = config;
