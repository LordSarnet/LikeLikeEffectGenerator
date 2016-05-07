/// <reference path="./Structures.ts"/>

namespace LLEAG {

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
    export function hslToRGB(h: number, s: number, l: number): RGB {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    export function getHexColor(color: RGB): string {
        // solution from http://stackoverflow.com/a/4090628
        let rs = ("0" + color.r.toString(16)).slice(-2);
        let gs = ("0" + color.g.toString(16)).slice(-2);
        let bs = ("0" + color.b.toString(16)).slice(-2);

        return "#" + rs + gs + bs;
    }

    // easing functions from http://gizma.com/easing/
    export function easeOutCubic(t: number) {
        t--;
        return (t * t * t + 1);
    };

    export function easeInCubic(t: number) {
	          return t*t*t;
    };

    export function easeInOutCubic(t: number) {
	       t *= 2;
        if (t < 1) return t * t * t / 2;
        t -= 2;
        return (t * t * t + 2) / 2;
    };
}
