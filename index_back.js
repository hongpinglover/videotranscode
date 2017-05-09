var express = require('express');
var path = require('path');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackhotMiddleware = require('webpack-hot-middleware');

var webpackconfig = require('./webpack.dev.back.js');
var compiler = webpack(webpackconfig);
var app = express();
var port = 8088, ip = '172.31.152.222';

app.use(express.static('views_back'))
app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackconfig.output.publicPath,
    noInfo: true
}));
app.use(webpackhotMiddleware(compiler));
app.use('/api', require('./router'));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname,'views_back/' + 'index.html'))
});

app.listen(port, ip, function (error) {
    if(error){
        console.error(error);
    }else {
        console.log('Listening on port %s, open http://%s:%s ', port, ip, port);
    }
})
