/// <reference path='./svg.js.d.ts' />
/// <reference path="./PSimple.ts"/>

namespace LLEAG {

    const PStarInnerRadiusRate = 0.55;

    export class PStar extends PSimple {

        protected generateParticlePath(drawer: svgjs.Doc): svgjs.Path{
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
            return drawer.path(pathCommands).fill(getHexColor(this.color));
        }

    }

}
