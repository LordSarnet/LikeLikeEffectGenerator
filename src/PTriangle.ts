/// <reference path='./svg.js.d.ts' />
/// <reference path="./PSimple.ts"/>

namespace LLEAG {

    const PStarInnerRadiusRate = 0.55;

    export class PTriangle extends PSimple {

        protected generateParticlePath(drawer: svgjs.Doc): svgjs.Path{
            let pathCommands = "";
            for(let i = 0; i < 3; i++){
                let x = Math.cos(Math.PI * 2 / 3 * i) * this.size;
                let y = Math.sin(Math.PI * 2 / 3 * i) * this.size;
                if(i == 0) pathCommands += "M ";
                else pathCommands += "L ";
                pathCommands += x.toString() + "," + y.toString();
                if(i == 2) pathCommands += " z";
            }
            return drawer.path(pathCommands).fill(getHexColor(this.color));
        }

    }

}
