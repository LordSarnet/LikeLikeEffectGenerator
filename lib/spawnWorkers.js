// this needs...
//  * filer-util.js
//  * FileSaver.min.js

// spawn web workers
var legWorker = new Worker("lib/MainWorker.js");
var getGIF = null;
var blobGIF = null;
legWorker.addEventListener('message', function(event) {
    var evData = event.data;
    switch (evData.state) {
        case 'progress':
            document.getElementById('progressBar').setAttribute("value", evData.value);
            document.getElementById('progressBar').setAttribute("max", evData.max);
            break;

        case 'finish':
            document.getElementById('progressBlock').setAttribute("style", "display: none;");
            document.getElementById('targetImg').src = evData.dataURL;
            document.getElementById('targetImg').removeAttribute("style");
            document.getElementById('downloadGIFButton1').setAttribute("class", "orange");
            document.getElementById('downloadGIFButton1').removeAttribute("disabled");
            document.getElementById('downloadGIFButton2').setAttribute("class", "orange");
            document.getElementById('downloadGIFButton2').removeAttribute("disabled");
            blobGIF = Util.dataURLToBlob(evData.dataURL);
            getGIF = function(){
                saveAs(blobGIF, "LikeEffectAnimation.gif");
            }
    }
});

var zipWorker = new Worker("lib/ZIPWorker.js");
var getZIP = null;
zipWorker.addEventListener('message', function(event) {
    var evData = event.data;
    switch (evData.state) {
        case 'finish':
            document.getElementById('downloadZIPButton').setAttribute("class", "orange");
            document.getElementById('downloadZIPButton').removeAttribute("disabled");
            getZIP = function() {
                saveAs(evData.blob, "allFrames.zip");
            }
    }
})
