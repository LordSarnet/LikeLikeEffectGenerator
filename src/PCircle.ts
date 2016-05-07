/// <reference path='./svg.js.d.ts' />
/// <reference path="./ParticleBase.ts"/>
/// <reference path="./Utils.ts"/>

namespace LLEAG {

    export class PCircle extends ParticleBase {
        public generateSVGTree(t: number): svgjs.G {
            // check if t > lifeTime
            if(t > this.lifeTime) return null;

            // create SVG Circle
            let container = document.createElement("div");
            let drawer = SVG(container);
            let circle = drawer.circle(this.size).translate(-this.size / 2, -this.size / 2).fill(getHexColor(this.color));

            // apply disappearing
            let disappearingRate = this.calcDisappearingRate(t);
            let currentGroup = drawer.group().scale(disappearingRate, disappearingRate).add(circle);

            // apply translate
            let translateXY = this.getBaseXY(t);
            return drawer.group().translate(translateXY.x, translateXY.y).add(currentGroup);
        };
    }

}
