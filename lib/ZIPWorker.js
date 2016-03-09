importScripts('jszip.min.js');

self.addEventListener('message', function(event){
    var evData = event.data;
    switch(evData.command){
        case 'package':
        package(evData);
        break;
    }
});

function package(evData){
    var zip = new JSZip();
    var dataArray = evData.dataArray;
    var svgSourceArray = evData.svgSourceArray;

    // package frame PNG images
    var zipFframes = zip.folder('frames');
    for(var fIndex = 0; fIndex < dataArray.length; fIndex++){
        zipFframes.file("frame" + fIndex + ".png", dataArray[fIndex], { base64: true });
    }

    // package svg source files
    var zipFsvg = zip.folder('effectSVG');
    for(var sIndex = 0; sIndex < svgSourceArray.length; sIndex++){
        zipFsvg.file("frame" + sIndex + ".svg", svgSourceArray[sIndex]);
    }

    var content = zip.generate({type:"blob"});

    self.postMessage({
        state: "finish",
        blob: content
    });

}
