/// <reference path='./svg.js.d.ts' />
/// <reference path="./PSimple.ts"/>

namespace LLEAG {

    const PStarInnerRadiusRate = 0.55;

    export class PSquare extends PSimple {

        protected generateParticlePath(drawer: svgjs.Doc): svgjs.Path{
            let pathCommands = "";
            pathCommands += "M " + (-this.size).toString() + "," + (this.size).toString();
            pathCommands += " L " + (this.size).toString() + "," + (this.size).toString();
            pathCommands += " L " + (this.size).toString() + "," + (-this.size).toString();
            pathCommands += " L " + (-this.size).toString() + "," + (-this.size).toString() + " z";
            return drawer.path(pathCommands).fill(getHexColor(this.color));
        }

    }

}
