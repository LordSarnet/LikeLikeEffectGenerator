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
    options.popCircleStartColorR = Math.round(document.getElementById('popCircleStartColor').jscolor.rgb[0]);
    options.popCircleStartColorG = Math.round(document.getElementById('popCircleStartColor').jscolor.rgb[1]);
    options.popCircleStartColorB = Math.round(document.getElementById('popCircleStartColor').jscolor.rgb[2]);
    options.popCircleEndColorR = Math.round(document.getElementById('popCircleEndColor').jscolor.rgb[0]);
    options.popCircleEndColorG = Math.round(document.getElementById('popCircleEndColor').jscolor.rgb[1]);
    options.popCircleEndColorB = Math.round(document.getElementById('popCircleEndColor').jscolor.rgb[2]);
    options.autoPopCircleEndColor = document.getElementById('autoPopCircleEndColor').checked;
    options.particleColorType = $('input[name=particleColorType]:checked').val();
    options.particleColor1R = Math.round(document.getElementById('particleColor1').jscolor.rgb[0]);
    options.particleColor1G = Math.round(document.getElementById('particleColor1').jscolor.rgb[1]);
    options.particleColor1B = Math.round(document.getElementById('particleColor1').jscolor.rgb[2]);
    options.particleColor2R = Math.round(document.getElementById('particleColor2').jscolor.rgb[0]);
    options.particleColor2G = Math.round(document.getElementById('particleColor2').jscolor.rgb[1]);
    options.particleColor2B = Math.round(document.getElementById('particleColor2').jscolor.rgb[2]);
    options.quantizeQuality = parseInt(document.getElementById('quantizeQuality').value);
    if (options.quantizeQuality.isNaN) {
        options.quantizeQuality = undefined;
    }
    if ((options.iconImg = document.getElementById('iconImg')) === null) {
        alert("アイコンに使用する画像が読み込まれていません。");
        return;
    }

    var debugOutputBlock = document.getElementById('debugOut');
    debugOutputBlock.innerHTML = "";

    // trimming image with circle
    if (options.trimmingCircle) options.iconImg = getTrimmedIconCanvas(options.iconImg);

    // generate monochrome icon
    var unpushedIcon = undefined;
    if (options.enableUnpushed){
        unpushedIcon = getMonochromeIconCanvas(options.iconImg, 1.0);
        unpushedIcon = getCenterScaledCanvas(unpushedIcon, options.size, 0.8);
        unpushedIcon = getWhiteBackgroundCanvas(unpushedIcon);
    }

    var tempBlock = document.getElementById('targetImg');
    var encoder = new GIFEncoder();
    encoder.setRepeat(0);
    encoder.setFrameRate(60.0);
    encoder.setQuality(options.quantizeQuality || 10);

    var canvases = [];

    for (var idx = 1; idx <= 80; idx++) {
        var svgBlock = generateFrame(idx, options);
        var tempBlock2 = document.createElement('span');
        tempBlock2.appendChild(svgBlock);
        var canvasBlockEffect = generateCanvasFromSVG(tempBlock2.innerHTML, options.size);

        var canvasBlock = document.createElement('canvas');
        canvasBlock.width = options.size;
        canvasBlock.height = options.size;
        var canvasBlockCtx = canvasBlock.getContext('2d');
        canvasBlockCtx.fillStyle = "#FFF";
        canvasBlockCtx.fillRect(0, 0, options.size, options.size);
        canvasBlockCtx = null;
        generateIconAnimationOnCanvas(idx, canvasBlock, options.iconImg);

        canvasBlock.getContext('2d').drawImage(canvasBlockEffect, 0, 0);
        // document.getElementById('col').appendChild(canvasBlock);
        canvases.push(canvasBlock);
        console.log("generating...");

        //debugOutputBlock.appendChild(svgBlock);
    }

    // set global pallete
    var canvasesGP = [];
    var sampleFrame = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 19, 20, 21];
    for (var idx = 0; idx < sampleFrame.length; idx++) {
        canvasesGP.push(canvases[sampleFrame[idx]].getContext('2d'));
        // debugOutputBlock.appendChild(canvases[sampleFrame[idx]]);
    }
    if(options.enableUnpushed){
        canvasesGP.push(unpushedIcon.getContext('2d'));
    }

    // generate global pallete
    if (!encoder.analyzeGlobalPalleteImage(canvasesGP, canvasesGP.length)) {
        throw new Error("Something wrong in analyzeGlobalPalleteImage()");
    }

    // normal animated GIF generation procedure
    encoder.start();
    if(options.enableUnpushed){
        for(var upIndex = 0; upIndex < 30; upIndex++) encoder.addFrame(unpushedIcon.getContext('2d'));
    }
    for (var idx = 0; idx < canvases.length; idx++) {
        encoder.addFrame(canvases[idx].getContext('2d'));
    }
    encoder.finish();
    var binaryGIF = encoder.stream().getData(); //notice this is different from the as3gif package!
    var dataURL = 'data:image/gif;base64,' + encode64(binaryGIF);

    //debugOutputBlock.innerHTML = "";

    tempBlock.src = null;
    tempBlock.src = dataURL;
}

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
    };

    fileReader.readAsDataURL(imgFile);

    var confirmBlock = document.getElementById('confirmLocalImg');
    confirmBlock.innerHTML = "";
    confirmBlock.appendChild(image);
    var confirmTextBlock = document.createElement('p');
    confirmTextBlock.innerHTML = "準備が完了すると上に読み込んだ画像が表示されます。";
    confirmBlock.appendChild(confirmTextBlock);
}

function getTrimmedIconCanvas(imgBlock){
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

function getMonochromeIconCanvas(imgBlock, brightnessFactor){
    var imgWidth = imgBlock.naturalWidth || imgBlock.width;
    var imgHeight = imgBlock.naturalHeight || imgBlock.height;
    var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;

    var retCanvas = document.createElement('canvas');
    retCanvas.width = imgLongEdge;
    retCanvas.height = imgLongEdge;

    ctx = retCanvas.getContext("2d");

    ctx.drawImage(imgBlock, (imgLongEdge - imgWidth) / 2, (imgLongEdge - imgHeight) / 2);

    var image = ctx.getImageData(0,0,imgLongEdge,imgLongEdge);
    var i = image.data.length;

    for(var iIndex = 0; iIndex < i; iIndex += 4){
        var a = image.data[iIndex];
        var c = 0.298912 * image.data[iIndex] + 0.586611 * image.data[iIndex+1] + 0.114478 * image.data[iIndex+2];
        c = 255.0 - c;
        c *= brightnessFactor;
        c = 255.0 - c;
        image.data[iIndex] = image.data[iIndex+1] = image.data[iIndex+2] = Math.round(c);
    }

    ctx.clearRect(0,0,imgLongEdge,imgLongEdge);
    ctx.putImageData(image,0,0);

    return retCanvas;
}

function getCenterScaledCanvas(imgBlock, size, scale){
    var retCanvas = document.createElement('canvas');
    retCanvas.width = retCanvas.height = size;

    var imgWidth = imgBlock.naturalWidth || imgBlock.width;
    var imgHeight = imgBlock.naturalHeight || imgBlock.height;
    var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;
    var dw = imgWidth / imgLongEdge * size * scale;
    var dh = imgHeight / imgLongEdge * size * scale;
    var dx = (size - dw) / 2.0;
    var dy = (size - dh) / 2.0;

    retCanvas.getContext('2d').drawImage(imgBlock, 0,0,imgWidth, imgHeight, dx, dy, dw, dh);

    return retCanvas;
}

function getWhiteBackgroundCanvas(imgBlock){
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
