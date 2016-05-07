/// <reference path='./svg.js.d.ts' />
/// <reference path="./ParticleBase.ts"/>
/// <reference path="./Utils.ts"/>

namespace LLEAG {

    export interface PSimpleOptions extends PBaseOptions {
        vSpinX: number;
        vSpinY: number;
        vSpinZ: number;
        initSpinZ: number;
    }

    export abstract class PSimple extends ParticleBase {

        private vSpinX: number;
        private vSpinY: number;
        private vSpinZ: number;
        private initSpinZ: number;

        constructor(options: PSimpleOptions){
            super(options);
            this.vSpinX = options.vSpinX;
            this.vSpinY = options.vSpinY;
            this.vSpinZ = options.vSpinZ;
            this.initSpinZ = options.initSpinZ;
        }

        public generateSVGTree(t: number): svgjs.G {
            // check if t > lifeTime
            if(t > this.lifeTime) return null;

            // create SVG Path
            let container = document.createElement("div");
            let drawer = SVG(container);
            let path = this.generateParticlePath(drawer);

            // apply spin by Z axis
            let currentGroup = drawer.group().rotate(360.0 * (this.initSpinZ + t * this.vSpinZ)).add(path);

            // apply spin by XY axis + disappearing
            let disappearingRate;
            if(t > this.lifeTime * (1.0 - this.disappearDurationRate)) disappearingRate = (this.lifeTime - t) / (this.lifeTime * this.disappearDurationRate);
            else disappearingRate = 1.0
            currentGroup = drawer.group().scale(Math.cos(Math.PI * 2.0 * (this.vSpinY * t)),Math.cos(Math.PI * 2.0 * (this.vSpinX * t)) * disappearingRate).add(currentGroup);

            // apply translate
            let translateXY = this.getBaseXY(t);
            currentGroup = drawer.group().translate(translateXY.x, translateXY.y).add(currentGroup);

            return currentGroup;
        }

        protected abstract generateParticlePath(drawer: svgjs.Doc): svgjs.Path;
    }

}
