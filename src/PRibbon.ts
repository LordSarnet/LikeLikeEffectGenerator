/// <reference path="./svg.js.d.ts"/>
/// <reference path="./ParticleBase.ts"/>
/// <reference path="./Utils.ts"/>
/// <reference path="./PopLineEffect.ts"/>

namespace LLEAG {

    export interface PRibbonOptions extends PBaseOptions {
        vSpinZ: number;
        initSpinZ: number;
        lineWidth?: number;
        popLineEffectInstance: PopLineEffect;
    }

    export class PRibbon extends ParticleBase {

        private vSpinZ: number;
        private initSpinZ: number;
        private lineWidth: number;
        private popLineEffectInstance: PopLineEffect;

        constructor(options: PRibbonOptions) {
            super(options);
            this.vSpinZ = options.vSpinZ;
            this.initSpinZ = options.initSpinZ;
            this.lineWidth = options.lineWidth;
            this.popLineEffectInstance = options.popLineEffectInstance;
        }

        public generateSVGTree(t: number): svgjs.G {
            // check if t > lifeTime + pleInstance.lifeTime
            if (t > this.lifeTime + this.popLineEffectInstance.getLifeTime()) return null;

            // create SVG Document
            let container = document.createElement("div");
            let drawer = SVG(container);
            let currentGroup = drawer.group();

            if (t > this.lifeTime) {
                // get PopLineEffect SVG group
                let pleSVGGroup = this.popLineEffectInstance.generateSVGTree(t - this.lifeTime, this.size);

                if(pleSVGGroup == null) return null;

                // apply last spin by Z axis
                currentGroup.translate(this.size, 0).add(pleSVGGroup);
                currentGroup = drawer.group().rotate(360.0 * (this.initSpinZ + this.lifeTime * this.vSpinZ)).add(currentGroup);

                // apply translate
                let translateXY = this.getBaseXY(this.lifeTime);
                currentGroup = drawer.group().translate(translateXY.x, translateXY.y).add(currentGroup);
            } else {
                // draw arc
                let arcData = "";
                let disappearingRate = this.calcDisappearingRate(t);
                if (disappearingRate < 1.0) {
                    let startX = Math.cos(Math.PI / 3 * (1.0 - disappearingRate)) * this.size;
                    let startY = Math.sin(Math.PI / 3 * (1.0 - disappearingRate)) * this.size;
                    arcData = "M " + (Math.cos(-Math.PI / 3 * easeInCubic(disappearingRate)) * this.size).toString() + "," + (Math.sin(-Math.PI / 3 * easeInCubic(disappearingRate)) * this.size).toString();
                    arcData += " A " + this.size.toString() + "," + this.size.toString() + " 0 0,1 " + this.size.toString() + ",0";
                    // TODO: 逆向きから近づいていくように変更
                } else {
                    arcData = "M " + (Math.cos(-Math.PI / 3) * this.size).toString() + "," + (Math.sin(-Math.PI / 3) * this.size).toString();
                    arcData += " A " + this.size.toString() + "," + this.size.toString() + " 0 0,1 " + this.size.toString() + ",0";
                }
                let arc = drawer.path(arcData).stroke({ color: getHexColor(this.color), width: this.lineWidth }).attr("stroke-linecap", "round");

                // apply spin by Z axis
                currentGroup.rotate(360.0 * (this.initSpinZ + t * this.vSpinZ)).add(arc);

                // apply translate
                let translateXY = this.getBaseXY(t);
                currentGroup = drawer.group().translate(translateXY.x, translateXY.y).add(currentGroup);
            }

            return currentGroup;
        }
    }
}
