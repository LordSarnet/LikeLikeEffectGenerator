/// <reference path="./svg.js.d.ts"/>
/// <reference path="./Structures.ts"/>
/// <reference path="./Utils.ts"/>
/// <reference path="./ParticlePreset1.ts"/>

declare var legWorker: Worker;
declare var zipWorker: Worker;

namespace LLEAG {

    const defaultSize = 200;

    export function generateLikeGIF10th() {
        // setting local valiables
        let size = parseInt((<HTMLInputElement>document.getElementById("generateSize")).value);
        if(isNaN(size)){
            size = defaultSize;
        }

        let trimmingCircle = (<HTMLInputElement>document.getElementById("trimmingCircle")).checked;
        let enableUnpushed = (<HTMLInputElement>document.getElementById("enableUnpushed")).checked;
        let disenableSmooth = (<HTMLInputElement>document.getElementById("disenableSmooth")).checked;
        // let frameRateDouble = (<HTMLInputElement>document.getElementById("frameRateDouble")).checked;
        let frameRate = 25//frameRateDouble ? 50.0 : 25.0;

        let iconImg: HTMLImageElement | HTMLCanvasElement = (<HTMLImageElement>document.getElementById("iconImg"))
        if(iconImg == null){
            alert("アイコンに使用する画像が読み込まれていません。");
            return;
        }

        // trimming image with circle
        if (trimmingCircle) iconImg = getTrimmedIconCanvas(iconImg);

        // generate monochrome icon
        let unpushedIcon = undefined;
        if (enableUnpushed) {
            unpushedIcon = getMonochromeIconCanvas(iconImg, 0.7);
            unpushedIcon = getCenterScaledCanvas(unpushedIcon, size, 0.8, disenableSmooth);
            unpushedIcon = getWhiteBackgroundCanvas(unpushedIcon);
        }

        let canvases: Array<HTMLCanvasElement> = [];
        let svgXMLStringsPLE: Array<string> = [];
        let svgXMLStringsParticle: Array<string> = [];
        let particlePreset = setAndGetPreset1();
        let drawer = SVG(document.createElement("div"));
        drawer.viewbox(-30, -40, 60, 60).size(size, size);
        let appearingPLEffect = new PopLineEffect({
            lifeTime: 0.8,
            lineWidthFactor: 0.05
        });
        let maxIndex = 3 * frameRate;

        for (let idx = 1; idx <= maxIndex; idx++) {
            // generate SVG Frame (PopLineEffect)
            let svgGroup = appearingPLEffect.generateSVGTree(idx / frameRate, 20);
            let canvasBlockPLE = null;
            if(svgGroup != null){
                drawer.clear(); // reset content
                svgGroup = drawer.group().add(svgGroup);
                svgXMLStringsPLE.push(drawer.svg());
                canvasBlockPLE = generateCanvasFromSVG(drawer.svg(), size);
            }

            // generate SVG Frame (Particle)
            drawer.clear(); // reset content
            svgGroup = drawer.group();
            for(let poIndex = 0; poIndex < particlePreset.length; poIndex++){
                let particleSVGGroup = particlePreset[poIndex].generateSVGTree(idx / frameRate);
                if (particleSVGGroup != null) {
                    drawer.group().add(particleSVGGroup);
                }
            }
            svgXMLStringsParticle.push(drawer.svg());
            let canvasBlockParticle = generateCanvasFromSVG(drawer.svg(), size);

            // generate canvas frame of icon animation
            let canvasBlockIcon = document.createElement('canvas');
            canvasBlockIcon.width = size;
            canvasBlockIcon.height = size;
            generateIconAnimationOnCanvas(idx, canvasBlockIcon, iconImg, disenableSmooth);

            // composite all canvases
            let canvasBlock = document.createElement("canvas");
            canvasBlock.width = size;
            canvasBlock.height = size;
            let canvasBlockCtx = canvasBlock.getContext("2d");
            canvasBlockCtx.fillStyle = "#FFF";
            canvasBlockCtx.fillRect(0, 0, size, size);
            if(canvasBlockPLE != null) canvasBlockCtx.drawImage(canvasBlockPLE, 0, 0);
            //canvasBlockCtx.drawImage(canvasBlockIcon, 0, 0);
            canvasBlockCtx.drawImage(canvasBlockParticle, 0, 0);
            canvasBlockCtx = null; // dispose canvasBlock context
            canvasBlockPLE = null;
            canvasBlockParticle = null;
            canvasBlockIcon = null; // dispose temporary canvases
            // document.getElementById('col').appendChild(canvasBlock);
            canvases.push(canvasBlock);
            console.log("generating...");
        }

        // set global pallete
        let sampleFrame = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 19, 20, 21];
        if (enableUnpushed) {
            let tempArray = [0];
            for (let sfIndex = 0; sfIndex < sampleFrame.length; sfIndex++) {
                tempArray.push(sampleFrame[sfIndex] + Math.round(frameRate * 0.6));
            }
            sampleFrame = tempArray;

            for (let upIndex = 0; upIndex < 30; upIndex++) {
                canvases.unshift(unpushedIcon);
            }
        }

        // create image data array
        let imageDataArray = [];
        for (let idaIndex = 0; idaIndex < canvases.length; idaIndex++) {
            imageDataArray.push(canvases[idaIndex].getContext('2d').getImageData(0, 0, size, size).data);
        }

        // send datas to GIF encoding worker
        legWorker.postMessage({
            command: "encode",
            nFrames: imageDataArray.length,
            height: size,
            width: size,
            frameRate: frameRate,
            quality: 10,
            gpFrameIndexArray: sampleFrame,
            imageDataArray: imageDataArray
        });

        // create image dataURL Array
        var imDataURLArray = [];
        for (var iduIndex = 0; iduIndex < canvases.length; iduIndex++) {
            imDataURLArray.push(canvases[iduIndex].toDataURL().replace("data:image/png;base64,", ""));
        }

        // send datas to ZIP worker
        zipWorker.postMessage({
            command: "package",
            dataArray: imDataURLArray,
            svgSourceArray: null
        });

        document.getElementById('progressBlock').setAttribute("style", "display: inline;");
        document.getElementById('progressBar').setAttribute("value", "0");
        document.getElementById('progressMessage').innerHTML = "GIFエンコード中...";

    }

    export function generateIconAnimationOnCanvas(t:number, canvasBlock: HTMLCanvasElement, iconImg: HTMLImageElement | HTMLCanvasElement, disenableSmooth: boolean){

    }

    export function getTrimmedIconCanvas(imgBlock: HTMLImageElement) {
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

    export function getMonochromeIconCanvas(imgBlock: HTMLImageElement | HTMLCanvasElement, brightnessFactor: number) {
        var imgWidth = (<HTMLImageElement>imgBlock).naturalWidth || imgBlock.width;
        var imgHeight = (<HTMLImageElement>imgBlock).naturalHeight || imgBlock.height;
        var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;

        var retCanvas = document.createElement('canvas');
        retCanvas.width = imgLongEdge;
        retCanvas.height = imgLongEdge;

        let ctx = retCanvas.getContext("2d");

        ctx.drawImage(imgBlock, (imgLongEdge - imgWidth) / 2, (imgLongEdge - imgHeight) / 2);

        var image = ctx.getImageData(0, 0, imgLongEdge, imgLongEdge);
        var i = image.data.length;
        let c = 255.0 * brightnessFactor;

        for (var iIndex = 0; iIndex < i; iIndex += 4) {
            image.data[iIndex] = image.data[iIndex + 1] = image.data[iIndex + 2] = Math.round(c);
        }

        ctx.clearRect(0, 0, imgLongEdge, imgLongEdge);
        ctx.putImageData(image, 0, 0);

        return retCanvas;
    }

    export function getCenterScaledCanvas(imgBlock: HTMLImageElement | HTMLCanvasElement, size: number, scale: number, disenableSmooth: boolean) {
        var retCanvas = document.createElement('canvas');
        retCanvas.width = retCanvas.height = size;

        var imgWidth = (<HTMLImageElement>imgBlock).naturalWidth || imgBlock.width;
        var imgHeight = (<HTMLImageElement>imgBlock).naturalHeight || imgBlock.height;
        var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;
        var dw = imgWidth / imgLongEdge * size * scale;
        var dh = imgHeight / imgLongEdge * size * scale;
        var dx = (size - dw) / 2.0;
        var dy = (size - dh) / 2.0;

        var context = (<any>retCanvas.getContext('2d')); // to use imageSmoothingEnabled
        if (disenableSmooth) {
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;
        }
        context.drawImage(imgBlock, 0, 0, imgWidth, imgHeight, dx, dy, dw, dh);

        return retCanvas;
    }

    export function getWhiteBackgroundCanvas(imgBlock: HTMLImageElement | HTMLCanvasElement) {
        var imgWidth = (<HTMLImageElement>imgBlock).naturalWidth || imgBlock.width;
        var imgHeight = (<HTMLImageElement>imgBlock).naturalHeight || imgBlock.height;
        var retCanvas = document.createElement('canvas');

        retCanvas.width = imgWidth;
        retCanvas.height = imgHeight;

        var ctx = retCanvas.getContext('2d');
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, imgWidth, imgHeight);
        ctx.drawImage(imgBlock, 0, 0);

        return retCanvas;
    }

    declare function canvg(c: HTMLCanvasElement, svgSource: string, options?: any);
    export function generateCanvasFromSVG(svgSource: string, size: number){

        var ret = document.createElement('canvas');
        ret.width = size;
        ret.height = size;

        canvg(ret, svgSource, { useCORS : true });

        return ret;

    }

}