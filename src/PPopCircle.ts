/// <reference path='./svg.js.d.ts' />
/// <reference path="./ParticleBase.ts"/>
/// <reference path="./Utils.ts"/>

namespace LLEAG {

    export class PPopCircle extends ParticleBase {

        public generateSVGTree(t: number): svgjs.G {
            // check if t > lifeTime
            if(t > this.lifeTime) return null;

            // create SVG Path
            let container = document.createElement("div");
            let drawer = SVG(container);
            let pathData = "";

            // draw outer circle
            pathData = 'M 0,-' + this.size + ' A ' + this.size +
                ',' + this.size + ' 0 1,0 0,' + this.size +
                ' A ' + this.size + ',' + this.size +
                ' 0 1,0 0,-' + this.size + ' z';

            // draw inner circle if this is disappearing
            let disappearingRate = this.calcDisappearingRate(t);
            if(disappearingRate != 1.0){
                let radius2 = easeOutCubic(1.0 - disappearingRate) * this.size;
                pathData += ' M 0,-' + radius2 + ' A ' + radius2 + ',' + radius2 + ' 0 1,1 0,' + radius2 + ' A ' + radius2 + ',' + radius2 + ' 0 1,1 0,-' + radius2 + ' z';
            }

            // set attributes
            let path = drawer.path(pathData).fill(getHexColor(this.color)).attr("fill-rule", "nonzero");

            // apply translate
            let translateXY = this.getBaseXY(t);
            return drawer.group().translate(translateXY.x, translateXY.y).add(path);
        }
    }
}
