/// <reference path="./svg.js.d.ts"/>
/// <reference path="./Structures.ts"/>

namespace LLEAG {
    export let kX: number = 1;
    export let kY: number = 4.5;
    export let vLastY: number = -20.0;
    //export let g: number = kY * -vLastY;

    export let defaultX0: number = 0.0;
    export let defaultY0: number = -40.0;

    export interface PBaseOptions{
        x0?: number;
        y0?: number;
        v0X: number;
        v0Y: number;
        size: number;
        lifeTime: number;
        disappearDurationRate: number;
        color: RGB;
    }

    export abstract class ParticleBase {

        protected x0: number;
        protected y0: number;
        protected v0X: number;
        protected v0Y: number;
        protected size: number;
        protected lifeTime: number;
        protected disappearDurationRate: number;
        protected color: RGB;

        constructor(options: PBaseOptions){
            // init fields
            this.x0 = options.x0 || defaultX0;
            this.y0 = options.y0 || defaultY0;
            this.v0X = options.v0X;
            this.v0Y = options.v0Y;
            this.size = options.size;
            this.lifeTime = options.lifeTime;
            this.disappearDurationRate = options.disappearDurationRate;
            this.color = options.color;
            if(!this.checkColorConsistency()) throw "out of color range";
        }

        protected getBaseXY(t: number): Point {
            // x = - (v0x / k) e^(-kt) + x0 + v0x / k
            // y = - ((k v0y + g) / k^2) e^(-kt) - g/k t + (y0 + ((k v0y + g) / k^2))
            let retP: Point = { x: 0, y: 0 };
            retP.x = (this.v0X / kX) * (1.0 - Math.exp(-kX * t)) + this.x0;
            let c0 = ((this.v0Y - vLastY) / kY)
            retP.y = c0 * (1.0 - Math.exp(-kY * t)) - vLastY * t + this.y0;

            return retP;
        }

        public abstract generateSVGTree(t: number): svgjs.G;

        private checkColorConsistency(): boolean {
            return this.color.r <= 255 && this.color.g <= 255 && this.color.b <= 255 &&
                    this.color.r >= 0 && this.color.g >= 0 && this.color.b >= 0;
        }

        protected calcDisappearingRate(t: number): number {
            return (t > this.lifeTime * (1.0 - this.disappearDurationRate)) ? (this.lifeTime - t) / (this.lifeTime * this.disappearDurationRate) : 1.0;
        }
    }
}
