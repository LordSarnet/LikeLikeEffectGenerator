function generateCanvasFromSVG(svgSource, size){

    var ret = document.createElement('canvas');
    ret.width = size;
    ret.height = size;

    canvg(ret, svgSource, { useCORS : true });

    return ret;

}
