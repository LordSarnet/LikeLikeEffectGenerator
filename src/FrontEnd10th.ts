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
        if (isNaN(size)) {
            size = defaultSize;
        }

        let trimmingCircle = (<HTMLInputElement>document.getElementById("trimmingCircle")).checked;
        let enableUnpushed = (<HTMLInputElement>document.getElementById("enableUnpushed")).checked;
        let disenableSmooth = (<HTMLInputElement>document.getElementById("disenableSmooth")).checked;
        let frameRateDouble = (<HTMLInputElement>document.getElementById("frameRateDouble")).checked;
        let frameRate = frameRateDouble ? 50.0 : 25.0;
        let iconScaleRate = parseInt((<HTMLInputElement>document.getElementById("iconScaleRate")).value) / 100.0;
        if(isNaN(iconScaleRate)){
            iconScaleRate = 0.6;
        }
        let illustPriorQuantize = (<HTMLInputElement>document.getElementById("illustPriorQuantize")).checked;;

        let iconImg: HTMLImageElement | HTMLCanvasElement = (<HTMLImageElement>document.getElementById("iconImg"))
        if (iconImg == null) {
            alert("アイコンに使用する画像が読み込まれていません。");
            return;
        }


        // trimming image with circle
        if (trimmingCircle) iconImg = getTrimmedIconCanvas(iconImg);

        // generate monochrome icon
        let unpushedIcon = undefined;
        if (enableUnpushed) {
            unpushedIcon = getMonochromeIconCanvas(iconImg, 0.7);
            unpushedIcon = getCenterScaledCanvas(unpushedIcon, size, iconScaleRate, disenableSmooth, 0, size / 6);
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
            if (svgGroup != null) {
                drawer.clear(); // reset content
                svgGroup = drawer.group().add(svgGroup);
                svgXMLStringsPLE.push(drawer.svg());
                canvasBlockPLE = generateCanvasFromSVG(drawer.svg(), size);
            }

            // generate SVG Frame (Particle)
            drawer.clear(); // reset content
            svgGroup = drawer.group();
            for (let poIndex = 0; poIndex < particlePreset.length; poIndex++) {
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
            generateIconAnimationOnCanvas(idx / frameRate, canvasBlockIcon, iconImg, disenableSmooth, iconScaleRate);

            // composite all canvases
            let canvasBlock = document.createElement("canvas");
            canvasBlock.width = size;
            canvasBlock.height = size;
            let canvasBlockCtx = canvasBlock.getContext("2d");
            canvasBlockCtx.fillStyle = "#FFF";
            canvasBlockCtx.fillRect(0, 0, size, size);
            if (canvasBlockPLE != null) canvasBlockCtx.drawImage(canvasBlockPLE, 0, 0);
            canvasBlockCtx.drawImage(canvasBlockIcon, 0, 0);
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
        let sampleFrame = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, ];
        if(illustPriorQuantize) sampleFrame = [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 70, 70, 70, 70, 70, 70];
        if(frameRateDouble){
            for(let sfIndex = 0; sfIndex < sampleFrame.length; sfIndex++){
                sampleFrame[sfIndex] = sampleFrame[sfIndex] * 2;
            }
        }
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

    export function generateIconAnimationOnCanvas(t: number, canvasBlock: HTMLCanvasElement, iconImg: HTMLImageElement | HTMLCanvasElement, disenableSmooth: boolean, scaleRate: number) {
        //var imgDataURL = imgBlock.src;
        let imgWidth = (<HTMLImageElement>iconImg).naturalWidth || iconImg.width;
        let imgHeight = (<HTMLImageElement>iconImg).naturalHeight || iconImg.height;
        let imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;
        let canvasSize = canvasBlock.width;

        let baseRadius = canvasSize * scaleRate / 2;

        let period = 0.4;
        let jumpY = 0;
        let upperJumpFactor = 0.12;
        let downerJumpFactor = 1;

        let context = canvasBlock.getContext('2d');
        if (disenableSmooth) {
            (<any>context).mozImageSmoothingEnabled = false; // DIRTY : to avoid error
            (<any>context).webkitImageSmoothingEnabled = false; // DIRTY : to avoid error
            context.msImageSmoothingEnabled = false;
            (<any>context).imageSmoothingEnabled = false; // DIRTY : to avoid error
        }
        let dw = 1.0 * imgWidth / imgLongEdge * baseRadius * 2.0;
        let dh = 1.0 * imgHeight / imgLongEdge * baseRadius * 2.0;

        // calcurate jumpY
        if(t < period){
            let jumpRealT = t - period / 2;
            let jumpT = jumpRealT * 4 / period;
            jumpY = (jumpT * jumpT - 4) * dh * upperJumpFactor;
        } else if(t >= period && t < period * 2){
            let jumpT = t - period / 2 * 3;
            jumpY = -(jumpT * jumpT - (period * period / 4)) * dh * downerJumpFactor;
        }

        let dx = (canvasSize - dw) / 2.0;
        let dy = canvasSize / 3 * 2 - dh / 2 + jumpY;

        context.drawImage(iconImg, 0, 0, imgWidth, imgHeight, dx, dy, dw, dh);

    }

    export function confirmImageSize() {
        var kSVGNS = 'http://www.w3.org/2000/svg';

        var size = parseInt((<HTMLInputElement>document.getElementById('generateSize')).value);
        if (isNaN(size)) {
            alert("サイズは半角数字のみで入力して下さい。");
            return false;
        }

        var svgBlock = document.createElementNS(kSVGNS, 'svg');
        svgBlock.setAttribute('width', size.toString());
        svgBlock.setAttribute('height', size.toString());
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

        var targetImgBlock = <HTMLImageElement>document.getElementById('targetImg');
        targetImgBlock.src = canvasBlock.toDataURL();
        targetImgBlock.setAttribute("style", "display: block;");
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

    export function getCenterScaledCanvas(imgBlock: HTMLImageElement | HTMLCanvasElement, size: number, scale: number, disenableSmooth: boolean, cx?: number, cy?: number) {
        var retCanvas = document.createElement('canvas');
        retCanvas.width = retCanvas.height = size;

        var imgWidth = (<HTMLImageElement>imgBlock).naturalWidth || imgBlock.width;
        var imgHeight = (<HTMLImageElement>imgBlock).naturalHeight || imgBlock.height;
        var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;
        var dw = imgWidth / imgLongEdge * size * scale;
        var dh = imgHeight / imgLongEdge * size * scale;
        cx = cx || 0;
        cy = cy || 0;
        var dx = (size - dw) / 2.0 + cx;
        var dy = (size - dh) / 2.0 + cy;

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
    export function generateCanvasFromSVG(svgSource: string, size: number) {

        var ret = document.createElement('canvas');
        ret.width = size;
        ret.height = size;

        canvg(ret, svgSource, { useCORS: true });

        return ret;

    }

}
