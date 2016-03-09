importScripts('jsgif/LZWEncoder.js', 'jsgif/NeuQuant.js', 'jsgif/GIFEncoderOnlyGlobal.js', 'jsgif/b64.js');

self.addEventListener('message', function(event) {
    var evData = event.data;
    switch (evData.command) {
        case 'encode':
            encode(evData);
            break;
    }
});

function encode(evData) {
    var nFrames = evData.nFrames,
        height = evData.height,
        width = evData.width,
        frameRate = evData.frameRate,
        quality = evData.quality;
        gpFrameIndexArray = evData.gpFrameIndexArray,
        imageDataArray = evData.imageDataArray;

    //console.log(JSON.stringify(imageDataArray));
    //console.log(JSON.stringify(evData));

    var encoder = new GIFEncoder();
    encoder.setRepeat(0);
    encoder.setFrameRate(frameRate);
    encoder.setQuality(quality);

    // set size
    encoder.setSize(width, height);

    // generate global palette
    var imageDataArrayGP = [];
    for(var idgpIndex = 0; idgpIndex < gpFrameIndexArray.length; idgpIndex++){
        imageDataArrayGP.push(imageDataArray[gpFrameIndexArray[idgpIndex]]);
    }
    if(!encoder.analyzeGlobalPalleteImage(imageDataArrayGP, gpFrameIndexArray.length, true)){
        throw new Error("Something wrong in analyzeGlobalPalleteImage()");
    }

    // generate animated GIF
    encoder.start();
    for(var fIndex = 0; fIndex < imageDataArray.length; fIndex++){
        encoder.addFrame(imageDataArray[fIndex], true);
        self.postMessage({ state: 'progress', value: fIndex, max: imageDataArray.length - 1 });
    }
    encoder.finish();
    var binaryGIF = encoder.stream().getData();
    var dataURL = 'data:image/gif;base64,' + encode64(binaryGIF);

    self.postMessage({ state: 'finish', dataURL: dataURL });
    //self.close();
}
