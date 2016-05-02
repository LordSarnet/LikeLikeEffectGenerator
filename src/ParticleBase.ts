import { RGB, Point } from "./Structures";

namespace LLEAG {
    export const kX: number = 0.1;
    export const kY: number = 0.1;
    export const vLastY: number = -1.0;
    export const g: number = kY * -vLastY;

    export const defaultX0: number = 0.0;
    export const defaultY0: number = 20.0;
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

    constructor(options: {x0?: number, y0?: number, v0X: number, v0Y: number, size: number, lifeTime: number, disappearDurationRate: number, color: RGB }){
        // init fields
        this.x0 = options.x0 || LLEAG.defaultX0;
        this.y0 = options.y0 || LLEAG.defaultY0;
        this.v0X = options.v0X;
        this.v0Y = options.v0Y;
        this.size = options.size;
        this.lifeTime = options.lifeTime;
        this.disappearDurationRate = options.disappearDurationRate;
        this.color = options.color;
    }

    protected getBaseXY(t: number): Point {
        // x = - (v0x / k) e^(-kt) + x0 + v0x / k
        // y = - ((k v0y + g) / k^2) e^(-kt) - g/k t + (y0 + ((k v0y + g) / k^2))
        let retP: Point = { x: 0, y: 0 };
        retP.x = (this.v0X / LLEAG.kX) * (1.0 - Math.exp(-LLEAG.kX * t)) + this.x0;
        let c0 = ((LLEAG.kY * this.v0Y + LLEAG.g) / (LLEAG.kY * LLEAG.kY))
        retP.y = c0 * (1.0 - Math.exp(-LLEAG.kY * t)) - LLEAG.vLastY * t + this.y0;

        return retP;
    }

    public abstract generateSVGTree(): SVGGElement;
}
