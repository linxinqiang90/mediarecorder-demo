var cStream,
  aStream,
  vid,
  recorder,
  chunks = [];
var options = {
  // audioBitsPerSecond: 128000, // 音频码率
  // videoBitsPerSecond: 100000
};

if (typeof MediaRecorder.isTypeSupported == 'function') {
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    options.mimeType = 'video/webm;codecs=vp8';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    options.mimeType = 'video/webm;codecs=vp9';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
    options.mimeType = 'video/webm;codecs=h264';
  }
}

function initAudioStream(stream) {
  if (!stream) {
    return;
  }

  var audioCtx = new AudioContext();

  // create a stream from our AudioContext
  var dest = audioCtx.createMediaStreamDestination();
  aStream = dest.stream;
  // connect our video element's output to the stream
  var sourceNode = audioCtx.createMediaElementSource(vid);
  sourceNode.connect(dest)
  sourceNode.connect(audioCtx.destination);

  vid.play();

  stream.addTrack(aStream.getAudioTracks()[0]);
};

vid = document.createElement('video');
vid.crossOrigin = 'anonymous';

function clickHandler() {

  canvas = $("canvas")[0]
  rec.innerText = '录制中,点击停止录制并播放....';
  cStream = canvas.captureStream(30);

  //bg
  vid.src = './sunny.mp3';
  vid.oncanplay = initAudioStream(cStream);

  if (options.mimeType) {
    console.info(options)
    recorder = new MediaRecorder(cStream, options);
  } else {
    recorder = new MediaRecorder(cStream);
  }

  recorder.start();

  recorder.ondataavailable = function (e) {
    chunks.push(e.data);
  };

  recorder.onstop = exportStream;

  rec.onclick = stopRecording;

};

function exportStream(e) {
  if (chunks.length) {
    var blob = new Blob(chunks, {type: "video/webm"})
    var vidURL = URL.createObjectURL(blob);
    var vid = document.createElement('video');
    vid.controls = true;
    vid.src = vidURL;
    vid.onend = function () {
      URL.revokeObjectURL(vidURL);
    }
    vid.onloadedmetadata = function () {
      console.info("onloadedmetadata")
      // handle chrome's bug
      console.info(vid)
      if (vid.duration === Infinity) {
        // set it to bigger than the actual duration
        // vid.currentTime = 1e101;
        // vid.ontimeupdate = function () {
        //   this.ontimeupdate = function (data) {
        //     console.info(data)
        //   }
        // }
      }
    }

    container.appendChild(vid);

    const downloadUrl = window.URL.createObjectURL(blob);
    link.href = downloadUrl;
    link.download = 'media.webm';
    link.disabled = false;
    link.click();
  } else {
    container.insertBefore(document.createTextNode('no data saved'), canvas);
  }
}

function stopRecording() {
  vid.pause();
  recorder.stop();
}