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
                      var res = e.target.result;
                      var filename = file.name;
                      $.ajax({
                          type: "POST",
                          url: 'api/transcode',
                          data: {
                              "video": res,
                              "filename": filename
                          },
                          dataType: 'json'
                      }).then(function(data) {
                          console.log(data);
                          var video = doc.querySelector('#destVideo');
                          video.src = data.video;
                          video.style.display = 'block';
                      }, function(error) {
                          console.error(error);
                      })
                  };
                  reader.readAsDataURL(file);
              }
          });
        }
    };
    dnd.init();
}(window,document));
