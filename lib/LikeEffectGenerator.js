/* jshint -W004 */

function generateFrame(f, options) {

    // settings
    var size = options.size || 200;

    var baseRadius = size * 0.38;

    /*
        var popCircleColor = {
            fromH : 345.0,
            fromS : 0.90,
            fromL : 0.45,
            toH : 280.0,
            toS : 0.65,
            toL : 0.80
        };
        */
    var popCircleColor = {
        fromR: options.popCircleStartColorR,
        fromG: options.popCircleStartColorG,
        fromB: options.popCircleStartColorB,
        toR: options.popCircleEndColorR,
        toG: options.popCircleEndColorG,
        toB: options.popCircleEndColorB
    };
    var particleCircleColor1 = {
        R: options.particleColor1R,
        G: options.particleColor1G,
        B: options.particleColor1B
    };
    var particleCircleColor2 = {
        R: options.particleColor2R,
        G: options.particleColor2G,
        B: options.particleColor2B
    };

    var kSVGNS = 'http://www.w3.org/2000/svg';
    // var block = document.getElementById('frame' + f.toString());
    // var block = document.createElement('span');

    // SVG
    var svg = document.createElementNS(kSVGNS, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', (-size / 2).toString() + ' ' + (-size / 2) + ' ' + size + ' ' + size);
    svg.setAttribute('xmlns', kSVGNS);
    svg.setAttribute('version', '1.1');

    // set background color to white
    /*
    var bgrect = document.createElementNS(kSVGNS, 'rect');
    bgrect.setAttribute('x', (-size / 2 - 10).toString());
    bgrect.setAttribute('y', (-size / 2 - 10).toString());
    bgrect.setAttribute('width', (size + 20).toString());
    bgrect.setAttribute('height', (size + 20).toString());
    bgrect.setAttribute('fill', "#FFFFFF");
    svg.appendChild(bgrect);
    */

    // Circle Animation (Pop)
    if (f >= 1 && f <= 13) {
        var circle1 = document.createElementNS(kSVGNS, 'path');
        var radius1 = easeOutExpo(0, 0.02 + 0.98 / 12.0 * (f - 1), 0.0, baseRadius, 1.0);
        var red = popCircleColor.fromR + (popCircleColor.toR - popCircleColor.fromR) / 12.0 * (f - 1);
        var green = popCircleColor.fromG + (popCircleColor.toG - popCircleColor.fromG) / 12.0 * (f - 1);
        var blue = popCircleColor.fromB + (popCircleColor.toB - popCircleColor.fromB) / 12.0 * (f - 1);
        circle1.setAttribute('fill', getRGB(red, green, blue));
        circle1.setAttribute('fill-rule', 'nonzero');
        var pathData = 'M 0,-' + radius1 + ' A ' + radius1 +
            ',' + radius1 + ' 0 1,0 0,' + radius1 +
            ' A ' + radius1 + ',' + radius1 +
            ' 0 1,0 0,-' + radius1 + ' z';
        if (f >= 6) {
            var radius2 = easeOutQuad(0, 0.15 + 0.80 / 7.0 * (f - 6), 0.0, baseRadius, 1.0);
            pathData += ' M 0,-' + radius2 + ' A ' + radius2 + ',' + radius2 + ' 0 1,1 0,' + radius2 +
                ' A ' + radius2 + ',' + radius2 + ' 0 1,1 0,-' + radius2 + ' z';
        }
        circle1.setAttribute('d', pathData);

        svg.appendChild(circle1);
    }

    // Circle Animation (Particles-1)
    if (f >= 12 && f <= 34) {
        for (var i = 0; i <= 6; i++) {
            var radius = baseRadius * 0.08 - easeInQuad(0, 1.0 / 22.0 * (f - 12), 0, baseRadius * 0.08, 1.0);
            var distance = baseRadius * 0.99 + easeOutQuad(0, 1.0 / 22.0 * (f - 12), 0, baseRadius * 0.10, 1.0);
            var circlep = createCircle(kSVGNS, Math.sin(Math.PI * 2.0 * (1.0 / 7.0 * i + 0.5)) * distance,
                Math.cos(Math.PI * 2.0 * (1.0 / 7.0 * i + 0.5)) * distance, radius);
            if (options.particleColorType == 1) circlep.setAttribute('fill', getRGB(particleCircleColor1.R, particleCircleColor1.G, particleCircleColor1.B));
            else circlep.setAttribute('fill', getHSL(360.0 / 7.0 * i, 0.8, 0.75));
            svg.appendChild(circlep);
        }
    }

    // Circle Animation (Particles-2)
    if (f >= 12 && f <= 42) {
        for (var i = 0; i <= 6; i++) {
            var radius = baseRadius * 0.09 - easeInQuint(0, 1.0 / 30.0 * (f - 12), 0, baseRadius * 0.09, 1.0);
            var distance = baseRadius * 0.92 + easeOutQuint(0, 1.0 / 30.0 * (f - 12), 0, baseRadius * 0.28, 1.0);
            var circlep = createCircle(kSVGNS, Math.sin(Math.PI * 2.0 * (1.0 / 7.0 * i + 0.5 - 0.03)) * distance,
                Math.cos(Math.PI * 2.0 * (1.0 / 7.0 * i + 0.5 - 0.025)) * distance, radius);
            if (options.particleColorType == 1) circlep.setAttribute('fill', getRGB(particleCircleColor2.R, particleCircleColor2.G, particleCircleColor2.B));
            else circlep.setAttribute('fill', getHSL(360.0 / 7.0 * i, 0.8, 0.75));
            svg.appendChild(circlep);
        }
    }

    // Icon Pop-up Animation
    /* This may cause tainting canvas, then drawing icon is proceed after canvas generated.
    if(f >= 12){
        var endFrame = 40;
        var ficon = f > endFrame ? endFrame : f;
        var iconGroup = document.createElementNS(kSVGNS, 'g');


        // var icon = document.createElementNS(kSVGNS, 'path');
        // icon.setAttribute('d', "M38.723,12c-7.187,0-11.16,7.306-11.723,8.131C26.437,19.306,22.504,12,15.277,12C8.791,12,3.533,18.163,3.533,24.647 C3.533,39.964,21.891,55.907,27,56c5.109-0.093,23.467-16.036,23.467-31.353C50.467,18.163,45.209,12,38.723,12z");
        // icon.setAttribute('fill', '#E81C4F');
        // iconGroup.appendChild(icon);

        var icon = document.createElementNS(kSVGNS, 'image');
        icon.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', imgDataURL);
        var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;
        icon.setAttribute('width', imgWidth.toString());
        icon.setAttribute('height', imgHeight.toString());
        icon.setAttribute('transform', 'translate(' + (-imgWidth / 2) + ',' + (-imgHeight / 2) + ')scale(' + (baseRadius * 2.0 / imgLongEdge) + ')');
        icon.setAttribute('x', '0');
        icon.setAttribute('y', '0');
        iconGroup.appendChild(icon);

        var t = (0.05 + 1.0 / (endFrame - 12.0) * (ficon - 12));
        if(t > 1.0) t = 1.0;
        var scale = easeOutBack(0, t, 0, size / 150, 1.0, 3);
        var tx = -54 / 2;
        var ty = -72 / 2 + (3 / scale);
        iconGroup.setAttribute('transform', 'scale(' + scale + ',' + scale + ')');

        svg.appendChild(iconGroup);
    }*/

    // block.appendChild(svg);
    // return '<?xml version="1.0"?>' + '\n' + block.innerHTML;
    return svg;

}

function generateIconAnimationOnCanvas(f, canvas, imgBlock, disenableSmooth, scaleRate) {

    //var imgDataURL = imgBlock.src;
    var imgWidth = imgBlock.naturalWidth || imgBlock.width;
    var imgHeight = imgBlock.naturalHeight || imgBlock.height;
    var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;
    var canvasSize = canvas.width;
    scaleRate = scaleRate || 0.8

    var baseRadius = canvasSize * scaleRate / 2;

    if (f >= 12) {
        var endFrame = 40;
        var ficon = f > endFrame ? endFrame : f;
        var t = (0.05 + 1.0 / (endFrame - 12.0) * (ficon - 12));
        if (t > 1.0) t = 1.0;
        var scale = easeOutBack(0, t, 0, 1.0, 1.0, 2.0);

        var context = canvas.getContext('2d');
        if (disenableSmooth) {
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;
        }
        var dw = 1.0 * imgWidth / imgLongEdge * baseRadius * 2.0 * scale;
        var dh = 1.0 * imgHeight / imgLongEdge * baseRadius * 2.0 * scale;
        var dx = (canvasSize - dw) / 2.0;
        var dy = (canvasSize - dh) / 2.0;

        context.drawImage(imgBlock, 0, 0, imgWidth, imgHeight, dx, dy, dw, dh);
    }
}

function createQuarticFunction(x1, y1, x2, y2, x3, y3, x4, y4) {

    var m1 = y1 / ((x1 - x2) * (x1 - x3) * (x1 - x4));
    var m2 = y2 / ((x2 - x1) * (x2 - x3) * (x2 - x4));
    var m3 = y3 / ((x3 - x1) * (x3 - x2) * (x3 - x4));
    var m4 = y4 / ((x4 - x1) * (x4 - x2) * (x4 - x3));

    var a = m1 + m2 + m3 + m4;
    var b = -((x2 + x3 + x4) * m1 + (x1 + x3 + x4) * m2 + (x1 + x2 + x4) * m3 + (x1 + x2 + x3) * m4);
    var c = ((x2 * x3) + (x2 * x4) + (x3 * x4)) * m1 + ((x1 * x3) + (x1 * x4) + (x3 * x4)) * m2 +
        ((x1 * x2) + (x1 * x4) + (x2 * x4)) * m3 + ((x1 * x2) + (x1 * x3) + (x2 * x3)) * m4;
    var d = -(m1 * x2 * x3 * x4 + x1 * m2 * x3 * x4 + x1 * x2 * m3 * x4 + x1 * x2 * x3 * m4);

    return function(x) {
        return a * x * x * x + b * x * x + c * x + d;
    };
}

function getHSL(h, s, l) {
    //return 'hsl(' + Math.round(h) + ',' + Math.round(s * 100.0) + '%,' + Math.round(l * 100.0) + '%)';
    var rgb = hslToRgb(h / 360, s, l);
    return getRGB(rgb[0], rgb[1], rgb[2]);
}

function getRGB(r, g, b) {
    return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
}

function createCircle(namespace, cx, cy, r) {
    var ret = document.createElementNS(namespace, 'circle');
    ret.setAttribute('cx', cx.toString());
    ret.setAttribute('cy', cy.toString());
    ret.setAttribute('r', r.toString());

    return ret;
}

// color space conversion Function
// from http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Easing Function from jquery.easing.js (https://github.com/danro/jquery-easing)
// "jquery-easing" is lisenced under the BSD Lisence.

// t: current time, b: beginning value, c: change In value, d: duration

function easeOutExpo(x, t, b, c, d) {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
}

function easeInQuint(x, t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
}

function easeOutQuint(x, t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
}

function easeInQuad(x, t, b, c, d) {
    return c * (t /= d) * t + b;
}

function easeOutQuad(x, t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
}

function easeOutBack(x, t, b, c, d, s) {
    if (s === undefined) s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}
