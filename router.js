var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({limit: '500mb',extend:true}))

var fs = require('fs');
var ffmpeg = require('ffmpeg');

var dealVideo = function (srcName, destName, req, res) {
    var srcUrl = './uploads/' + srcName;
    var destUrl = './uploads/' + destName;
    var base64Str = req.body.video.split('base64,')[1];
    var buf = new Buffer(base64Str,'base64');
    fs.writeFile(srcUrl, buf, function(error) {
        if(error){
            res.send({status: 0, msg: error});
        }else {
            var process = new ffmpeg(srcUrl);
            process.then(function(video){
                console.log('transcoding...');
                video.setVideoFormat('mp4')
                     .save(destUrl,function (err) {
                          if(!err){
                              res.send({status: 1, msg:'转码成功', video: 'api/getVideo/'+destName});
                              console.log('transcode success!');
                          }else {
                              console.log(err);
                          }
                     })
            },function (err) {
                console.log('Error:' + err);
            })
        }
    })
}
router.post('/transcode', function (req, res) {
    console.log('receive transcode request');

    var srcName = req.body.filename;
    var destName = req.body.filename.replace(/\.(.)+$/,'.mp4');
    var destUrl = './uploads/' + destName;

    res.set('Content-Type', 'pplication/json;charset=uft-8');
    fs.exists(destUrl, function (exist) {
        if(!exist){
            dealVideo(srcName, destName, req, res);
        }else{
            res.send({status: 1, msg:'视频已存在', video: 'api/getVideo/' + destName});
            console.log('transcode video already exists!');
        }
    });
});

router.get('/getVideo/:filename', function (req, res) {
    console.log('getVideo');

    var fileUrl = './uploads/' + req.params.filename;
    var stat = fs.statSync(fileUrl), size = stat.size;
    var range = req.headers.range;
    var parts = range.replace(/bytes=/,'').split('-');
    var start = parseInt(parts[0]), end = parseInt(parts[1]?parts[1]:size-1);

    // 断点下载必须设置Content-Range、Content-Length、状态码为206
    // 普通下载则只需要Content-Length，状态码一般为200
    res.writeHead(206, 'Partial Content', {
        'Content-Type': 'video/mp4',
        'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
        'Content-Length': end - start + 1
    });

    var stream = fs.createReadStream(fileUrl, { 'start': start, 'end': end });
    stream.pipe(res);
    stream.on('close', function () {
        console.log('stream close');
        res.end();
    });
});

module.exports = router;
