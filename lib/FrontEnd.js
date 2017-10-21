function generateLikeGIF() {
    var size = 200; // TODO : get from options on the page

    // setting option object
    var options = {};
    options.size = parseInt(document.getElementById('generateSize').value);
    if (options.size.isNaN) {
        options.size = undefined;
    }
    options.trimmingCircle = document.getElementById('trimmingCircle').checked;
    options.enableUnpushed = document.getElementById('enableUnpushed').checked;
    options.disenableSmooth = document.getElementById('disenableSmooth').checked;
    var rgbObj = getRGBFromColorCode(document.getElementById('popCircleStartColor').value);
    options.popCircleStartColorR = rgbObj.r;
    options.popCircleStartColorG = rgbObj.g;
    options.popCircleStartColorB = rgbObj.b;
    rgbObj = getRGBFromColorCode(document.getElementById('popCircleEndColor').value);
    options.popCircleEndColorR = rgbObj.r;
    options.popCircleEndColorG = rgbObj.g;
    options.popCircleEndColorB = rgbObj.b;
    options.particleColorType = $('input[name=particleColorType]:checked').val();
    rgbObj = getRGBFromColorCode(document.getElementById('particleColor1').value);
    options.particleColor1R = rgbObj.r;
    options.particleColor1G = rgbObj.g;
    options.particleColor1B = rgbObj.b;
    rgbObj = getRGBFromColorCode(document.getElementById('particleColor2').value);
    options.particleColor2R = rgbObj.r;
    options.particleColor2G = rgbObj.g;
    options.particleColor2B = rgbObj.b;
    options.quantizeQuality = parseInt(document.getElementById('quantizeQuality').value);
    if (options.quantizeQuality.isNaN) {
        options.quantizeQuality = undefined;
    }
    if ((options.iconImg = document.getElementById('iconImg')) === null) {
        alert("アイコンに使用する画像が読み込まれていません。");
        return;
    }
    options.iconScaleRate = parseInt(document.getElementById("iconScaleRate").value);
    if(isNaN(options.iconScaleRate)){
        options.iconScaleRate = 0.8;
    } else {
        options.iconScaleRate = options.iconScaleRate / 100.0
    }
    options.illustPriorQuantize = document.getElementById("illustPriorQuantize").checked;

    var debugOutputBlock = document.getElementById('debugOut');
    debugOutputBlock.innerHTML = "";

    // trimming image with circle
    if (options.trimmingCircle) options.iconImg = getTrimmedIconCanvas(options.iconImg);

    // generate monochrome icon
    var unpushedIcon = undefined;
    if (options.enableUnpushed) {
        unpushedIcon = getMonochromeIconCanvas(options.iconImg, 0.7);
        unpushedIcon = getCenterScaledCanvas(unpushedIcon, options.size, options.iconScaleRate, options.disenableSmooth);
        unpushedIcon = getWhiteBackgroundCanvas(unpushedIcon);
    }

    var tempBlock = document.getElementById('targetImg');

    var canvases = [];
    var svgBlocks = [];
    var imDataURLArray = []; // keep transparent-canvas data urls
    var transparentCanvasBlock = document.createElement('canvas');
    transparentCanvasBlock.width = options.size;
    transparentCanvasBlock.height = options.size;
    var transparentCanvasBlockCtx = transparentCanvasBlock.getContext('2d');

    for (var idx = 1; idx <= 80; idx++) {
        // generate effect
        var svgBlock = generateFrame(idx, options);
        svgBlocks.push(svgBlock);
        var tempBlock2 = document.createElement('span');
        tempBlock2.appendChild(svgBlock);
        // var canvasBlockEffect = generateCanvasFromSVG(tempBlock2.innerHTML, options.size);
        var canvasBlockEffect = generateCanvasFromSVG(svgBlock.outerHTML, options.size);

        // generate base canvas
        var canvasBlock = document.createElement('canvas');
        canvasBlock.width = options.size;
        canvasBlock.height = options.size;
        var canvasBlockCtx = canvasBlock.getContext('2d');
        canvasBlockCtx.fillStyle = "#FFF";
        canvasBlockCtx.fillRect(0, 0, options.size, options.size);
        canvasBlockCtx = null;
        
        // reset transparentCanvas and render animation frame
        transparentCanvasBlockCtx.clearRect(0, 0, options.size, options.size);
        generateIconAnimationOnCanvas(idx, transparentCanvasBlock, options.iconImg, options.disenableSmooth, options.iconScaleRate);
        transparentCanvasBlockCtx.drawImage(canvasBlockEffect, 0, 0);

        // store animation frame with transparency
        imDataURLArray.push(transparentCanvasBlock.toDataURL().replace("data:image/png;base64,", ""));

        canvasBlock.getContext('2d').drawImage(transparentCanvasBlock, 0, 0);
        // document.getElementById('col').appendChild(canvasBlock);
        canvases.push(canvasBlock);
        console.log("generating...");

        //debugOutputBlock.appendChild(svgBlock);
    }

    // set global pallete
    var sampleFrame = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 19, 20, 21];
    if(options.illustPriorQuantize) sampleFrame = [1, 2, 7, 8, 12, 13, 14, 15, 50, 50, 50, 50, 50, 50];
    if (options.enableUnpushed) {
        var tempArray = [0];
        for (var sfIndex = 0; sfIndex < sampleFrame.length; sfIndex++) {
            tempArray.push(sampleFrame[sfIndex] + 30);
        }
        sampleFrame = tempArray;

        for (var upIndex = 0; upIndex < 30; upIndex++) {
            canvases.unshift(unpushedIcon);
        }
    }

    // create image data array
    var imageDataArray = [];
    for (var idaIndex = 0; idaIndex < canvases.length; idaIndex++) {
        imageDataArray.push(canvases[idaIndex].getContext('2d').getImageData(0, 0, options.size, options.size).data);
    }

    // send datas to GIF encoding worker
    legWorker.postMessage({
        command: "encode",
        nFrames: imageDataArray.length,
        height: options.size,
        width: options.size,
        frameRate: 60.0,
        quality: options.quantizeQuality,
        gpFrameIndexArray: sampleFrame,
        imageDataArray: imageDataArray
    });

    // create svg source Array
    var svgSourceArray = [];
    for (var ssaIndex = 0; ssaIndex < svgBlocks.length; ssaIndex++){
        svgSourceArray.push(svgBlocks[ssaIndex].outerHTML);
    }

    // send datas to ZIP worker
    zipWorker.postMessage({
        command: "package",
        dataArray: imDataURLArray,
        svgSourceArray: svgSourceArray
    });

    // var dataURL = 'data:image/gif;base64,' + encode64(binaryGIF);

    document.getElementById('progressBlock').setAttribute("style", "display: inline;");
    document.getElementById('progressBar').setAttribute("value", "0");
    document.getElementById('progressMessage').innerHTML = "GIFエンコード中...";

    tempBlock.src = "";
    tempBlock.setAttribute("style", "display: none;");
}

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

function confirmImageSize() {
    var kSVGNS = 'http://www.w3.org/2000/svg';

    var size = parseInt(document.getElementById('generateSize').value);
    if (size.isNaN) {
        alert("サイズは半角数字のみで入力して下さい。");
        return false;
    }

    var svgBlock = document.createElementNS(kSVGNS, 'svg');
    svgBlock.setAttribute('width', size);
    svgBlock.setAttribute('height', size);
    svgBlock.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svgBlock.setAttribute('xmlns', kSVGNS);
    svgBlock.setAttribute('version', '1.1');

    var rectBlock = document.createElementNS(kSVGNS, 'rect');
    rectBlock.setAttribute('x', '0');
    rectBlock.setAttribute('y', '0');
    rectBlock.setAttribute('width', size.toString());
    rectBlock.setAttribute('height', size.toString());
    rectBlock.setAttribute('stroke', '#CCC');
    rectBlock.setAttribute('stroke-width', '4');
    rectBlock.setAttribute('fill', 'none');
    svgBlock.appendChild(rectBlock);

    var textBlock = document.createElementNS(kSVGNS, 'text');
    textBlock.setAttribute('x', (size / 2).toString());
    textBlock.setAttribute('y', (size / 2).toString());
    textBlock.setAttribute('text-anchor', 'middle');
    textBlock.setAttribute('font-family', 'sans-serif');
    textBlock.setAttribute('font-size', '20');
    textBlock.setAttribute('fill', '#CCC');
    textBlock.innerHTML = size.toString() + ' x ' + size.toString();
    svgBlock.appendChild(textBlock);

    var tempBlock = document.createElement('span');
    tempBlock.appendChild(svgBlock);
    var canvasBlock = generateCanvasFromSVG(tempBlock.innerHTML, size);

    var targetImgBlock = document.getElementById('targetImg');
    targetImgBlock.src = canvasBlock.toDataURL();
    targetImgBlock.setAttribute("style", "display: block;");
}

function loadImg() {

    var imgFile = document.getElementById('localImgFile').files[0];
    if (!imgFile.type.match(/^image\/(png|jpeg|gif)$/)) {
        alert("png,jpg,gif以外の画像ファイルは扱えません。");
        return;
    }

    var image = document.createElement('img');
    image.crossOrigin = "anonymous";
    image.setAttribute('style', 'width: auto; height: 200px');
    image.setAttribute('id', 'iconImg');
    var fileReader = new FileReader();

    fileReader.onload = function(evt) {
        image.src = evt.target.result;
        document.getElementById('generateButton1').removeAttribute("disabled");
        document.getElementById('generateButton1').setAttribute("class", "blue");
        document.getElementById('generateButton2').removeAttribute("disabled");
        document.getElementById('generateButton2').setAttribute("class", "blue");
    };

    fileReader.readAsDataURL(imgFile);

    var confirmBlock = document.getElementById('confirmLocalImg');
    confirmBlock.innerHTML = "";
    confirmBlock.appendChild(image);
    var confirmTextBlock = document.createElement('p');
    confirmTextBlock.innerHTML = "準備が完了すると上に読み込んだ画像が表示されます。";
    confirmBlock.appendChild(confirmTextBlock);
}

function getTrimmedIconCanvas(imgBlock) {
    var imgLongEdge = imgBlock.naturalWidth > imgBlock.naturalHeight ? imgBlock.naturalWidth : imgBlock.naturalHeight;

    var imgEditCanvas = document.createElement('canvas');
    imgEditCanvas.width = imgLongEdge;
    imgEditCanvas.height = imgLongEdge;

    var imgEditCanvasContext = imgEditCanvas.getContext('2d');
    imgEditCanvasContext.beginPath();
    imgEditCanvasContext.arc(imgLongEdge / 2, imgLongEdge / 2, imgLongEdge / 2, 0, 2 * Math.PI);
    imgEditCanvasContext.closePath();
    imgEditCanvasContext.clip();
    imgEditCanvasContext.drawImage(imgBlock, (imgLongEdge - imgBlock.naturalWidth) / 2, (imgLongEdge - imgBlock.naturalHeight) / 2);

    return imgEditCanvas;
}

function getMonochromeIconCanvas(imgBlock, brightnessFactor) {
    var imgWidth = imgBlock.naturalWidth || imgBlock.width;
    var imgHeight = imgBlock.naturalHeight || imgBlock.height;
    var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;

    var retCanvas = document.createElement('canvas');
    retCanvas.width = imgLongEdge;
    retCanvas.height = imgLongEdge;

    ctx = retCanvas.getContext("2d");

    ctx.drawImage(imgBlock, (imgLongEdge - imgWidth) / 2, (imgLongEdge - imgHeight) / 2);

    var image = ctx.getImageData(0, 0, imgLongEdge, imgLongEdge);
    var i = image.data.length;

    for (var iIndex = 0; iIndex < i; iIndex += 4) {
        /*
        var c = 0.298912 * image.data[iIndex] + 0.586611 * image.data[iIndex + 1] + 0.114478 * image.data[iIndex + 2];
        c = 255.0 - c;
        c *= brightnessFactor;
        c = 255.0 - c;
        */
        c = 255.0 * brightnessFactor;
        image.data[iIndex] = image.data[iIndex + 1] = image.data[iIndex + 2] = Math.round(c);
    }

    ctx.clearRect(0, 0, imgLongEdge, imgLongEdge);
    ctx.putImageData(image, 0, 0);

    return retCanvas;
}

function getCenterScaledCanvas(imgBlock, size, scale, disenableSmooth) {
    var retCanvas = document.createElement('canvas');
    retCanvas.width = retCanvas.height = size;

    var imgWidth = imgBlock.naturalWidth || imgBlock.width;
    var imgHeight = imgBlock.naturalHeight || imgBlock.height;
    var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;
    var dw = imgWidth / imgLongEdge * size * scale;
    var dh = imgHeight / imgLongEdge * size * scale;
    var dx = (size - dw) / 2.0;
    var dy = (size - dh) / 2.0;

    var context = retCanvas.getContext('2d');
    if (disenableSmooth) {
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
    }
    context.drawImage(imgBlock, 0, 0, imgWidth, imgHeight, dx, dy, dw, dh);

    return retCanvas;
}

function getWhiteBackgroundCanvas(imgBlock) {
    var imgWidth = imgBlock.naturalWidth || imgBlock.width;
    var imgHeight = imgBlock.naturalHeight || imgBlock.height;
    var retCanvas = document.createElement('canvas');

    retCanvas.width = imgWidth;
    retCanvas.height = imgHeight;

    var ctx = retCanvas.getContext('2d');
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, imgWidth, imgHeight);
    ctx.drawImage(imgBlock, 0, 0);

    return retCanvas;
}

function getRGBFromColorCode(colorCodeStr){
    var r = parseInt(colorCodeStr.slice(1,3), 16);
    var g = parseInt(colorCodeStr.slice(3,5), 16);
    var b = parseInt(colorCodeStr.slice(5,7), 16);
    return { "r": r, "g": g, "b": b };
}
