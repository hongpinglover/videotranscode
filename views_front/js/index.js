var worker;
var sampleVideoData;
var filesElement;
var running = false;
var isWorkerLoaded = false;
var cmdText = '-i [input] -f mp4 [output]';

(function(win,doc) {
    var dnd = {
        init: function() {
            var me = this;
            //拖拽上传
            var preview = doc.querySelector('#container .preview');
            preview.addEventListener('dragover', function(e) {
                e.preventDefault();
            }, false);
            preview.addEventListener('drop', function(e) {
                // 操作系统拖放文件到浏览器需要取消默认行为
                e.preventDefault();
                me.analyse(e.dataTransfer.files);
            }, false);
            //点击上传
            var input = doc.querySelector('#video');
            input.addEventListener('change', function(e) { //change 事件监听
                me.analyse(this.files);
            });
        },
        analyse: function(files){
            [].forEach.call(files, function(file) { console.log(file);
              if (file && file.type.match('video/*')) {
                  var reader = new FileReader();
                  reader.onload = function(e) {
                      var arrayBuffer = e.target.result;
                      sampleVideoData = new Uint8Array(arrayBuffer);
                      var input = file.name, output = input.replace(/\.(.)+$/, '.mp4');
                      cmdText = cmdText.replace('[input]', input);
                      cmdText = cmdText.replace('[output]', output)
                      runCommand(cmdText)
                  };
                  reader.readAsArrayBuffer(file);
              }
          });
        }
    };
    dnd.init();
}(window,document));

function isReady() {
  return !running && isWorkerLoaded  && sampleVideoData;
}

function startRunning() {
  running = true;
}
function stopRunning() {
  running = false;
}

function parseArguments(text) {
  text = text.replace(/\s+/g, ' ');
  var args = [];
  // Allow double quotes to not split args.
  text.split('"').forEach(function(t, i) {
    t = t.trim();
    if ((i % 2) === 1) {
      args.push(t);
    } else {
      args = args.concat(t.split(" "));
    }
  });
  return args;
}

//to be update
function runCommand(text) {
  if (isReady()) {
    startRunning();
    var args = parseArguments(text);
    console.log(args);
    worker.postMessage({
      type: "command",
      arguments: args,
      files: [
        {
          "name": "input.webm",
          "data": sampleVideoData
        }
      ]
    });
  }
}

function getVideo(fileData, fileName) {
    var blob = new Blob([fileData]);
    var src = window.URL.createObjectURL(blob);
    return src;
}

function initWorker() {
  worker = new Worker("js/worker.js");
  worker.onmessage = function (event) {
    var message = event.data;
    if (message.type == "ready") {
      isWorkerLoaded = true;
      worker.postMessage({
        type: "command",
        arguments: ["-help"]
      });
    } else if (message.type == "stdout") {
      console.log(message.data + "\n");
    } else if (message.type == "start") {
      console.log("Worker has received command\n");
    } else if (message.type == "done") {
      stopRunning();
      var buffers = message.data;
      buffers.forEach(function(file) {
        filesElement.src =  getVideo(file.data, file.name);
      });
    }
  };
}

document.addEventListener("DOMContentLoaded", function() {
    initWorker();
    filesElement = document.querySelector("#destVideo");

});
