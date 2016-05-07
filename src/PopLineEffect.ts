/// <reference path='./svg.js.d.ts' />
/// <reference path="./Structures.ts"/>
/// <reference path="./Utils.ts"/>

namespace LLEAG {

    export interface PLEOptions {
        lifeTime: number;
        lineWidthFactor: number;
        lineNumber? : number;
        lineColor?: RGB;
    }

    const PLELineSaturation = 0.8;
    const PLELineLightness = 0.7;

    export class PopLineEffect {

        private lifeTime: number;
        private lineWidthFactor: number;
        private lineNumber: number;
        private lineColor: RGB;

        constructor(options: PLEOptions){
            this.lifeTime = options.lifeTime;
            this.lineWidthFactor = options.lineWidthFactor;

            this.lineNumber = options.lineNumber || 8;
            // guarantee that lineNumber is integer value
            this.lineNumber = Math.ceil(this.lineNumber);

            this.lineColor = options.lineColor || null;
        }

        public generateSVGTree(t: number, size: number){
            // check if t > lifeTime
            if(t > this.lifeTime) return null;

            // create SVG group
            let container = document.createElement("div");
            let drawer = SVG(container);
            let currentGroup = drawer.group();

            // generate lines
            for(let i = 0; i < this.lineNumber; i++){
                let baseX = Math.cos(Math.PI * 2 / this.lineNumber * i) * size * (1.0 + 0.1 * t);
                let baseY = Math.sin(Math.PI * 2 / this.lineNumber * i) * size * (1.0 + 0.1 * t);
                let startX = baseX * easeOutCubic(t / this.lifeTime);
                let startY = baseY * easeOutCubic(t / this.lifeTime);
                let color = this.lineColor;
                if(color == null){
                    // generate rainbow colors
                    let hue = i / this.lineNumber * 2.0;
                    if(hue > 1.0) hue -= 1.0;
                    color = hslToRGB(hue, PLELineSaturation, PLELineLightness);
                }
                let lineWidth = size * this.lineWidthFactor;

                let line = drawer.line(startX, startY, baseX, baseY)
                    .stroke({ color: getHexColor(color), width: lineWidth }).attr("stroke-linecap", "round");
                currentGroup.add(line);
            }

            return currentGroup;
        }

        public getLifeTime(): number{
            return this.lifeTime;
        }
    }
}
