/// <reference path='./svg.js.d.ts' />
/// <reference path="./ParticleBase.ts"/>

namespace LLEAG {

    export interface PStarOptions extends PBaseOptions {
        vSpinX: number;
        vSpinY: number;
        vSpinZ: number;
        initSpinZ: number;
    }

    const PStarInnerRadiusRate = 0.55;

    export class PStar extends ParticleBase {

        private vSpinX: number;
        private vSpinY: number;
        private vSpinZ: number;
        private initSpinZ: number;

        constructor(options: PStarOptions){
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
            let pathCommands = "";
            for(let i = 0; i < 5; i++){
                let x = Math.cos(Math.PI * 2.0 / 5.0 * i) * this.size;
                let y = Math.sin(Math.PI * 2.0 / 5.0 * i) * this.size;
                if(i == 0) pathCommands += "M ";
                else pathCommands += "L ";
                pathCommands += x.toString() + "," + y.toString() + " ";

                x = Math.cos(Math.PI * (2.0 / 5.0 * i + 1.0 / 5.0)) * this.size * PStarInnerRadiusRate;
                y = Math.sin(Math.PI * (2.0 / 5.0 * i + 1.0 / 5.0)) * this.size * PStarInnerRadiusRate;
                pathCommands += "L " + x.toString() + "," + y.toString() + " ";
                if(i == 4) pathCommands += "z";
            }
            let starPath = drawer.path(pathCommands).fill(this.getHexColor());

            // apply spin by Z axis
            let currentGroup = drawer.group().rotate(360.0 * (this.initSpinZ + t * this.vSpinZ)).add(starPath);

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
    }

}
