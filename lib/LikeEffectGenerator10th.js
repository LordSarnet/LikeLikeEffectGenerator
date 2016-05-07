var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var LLEAG;
(function (LLEAG) {
    function hslToRGB(h, s, l) {
        var r, g, b;
        if (s == 0) {
            r = g = b = l;
        }
        else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
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
    LLEAG.hslToRGB = hslToRGB;
    function getHexColor(color) {
        var rs = ("0" + color.r.toString(16)).slice(-2);
        var gs = ("0" + color.g.toString(16)).slice(-2);
        var bs = ("0" + color.b.toString(16)).slice(-2);
        return "#" + rs + gs + bs;
    }
    LLEAG.getHexColor = getHexColor;
    function easeOutCubic(t) {
        t--;
        return (t * t * t + 1);
    }
    LLEAG.easeOutCubic = easeOutCubic;
    ;
    function easeInCubic(t) {
        return t * t * t;
    }
    LLEAG.easeInCubic = easeInCubic;
    ;
    function easeInOutCubic(t) {
        t *= 2;
        if (t < 1)
            return t * t * t / 2;
        t -= 2;
        return (t * t * t + 2) / 2;
    }
    LLEAG.easeInOutCubic = easeInOutCubic;
    ;
})(LLEAG || (LLEAG = {}));
var LLEAG;
(function (LLEAG) {
    var PLELineSaturation = 0.8;
    var PLELineLightness = 0.7;
    var PopLineEffect = (function () {
        function PopLineEffect(options) {
            this.lifeTime = options.lifeTime;
            this.lineWidthFactor = options.lineWidthFactor;
            this.lineNumber = options.lineNumber || 8;
            this.lineNumber = Math.ceil(this.lineNumber);
            this.lineColor = options.lineColor || null;
        }
        PopLineEffect.prototype.generateSVGTree = function (t, size) {
            if (t > this.lifeTime)
                return null;
            var container = document.createElement("div");
            var drawer = SVG(container);
            var currentGroup = drawer.group();
            for (var i = 0; i < this.lineNumber; i++) {
                var baseX = Math.cos(Math.PI * 2 / this.lineNumber * i) * size * (1.0 + 0.1 * t);
                var baseY = Math.sin(Math.PI * 2 / this.lineNumber * i) * size * (1.0 + 0.1 * t);
                var startX = baseX * LLEAG.easeOutCubic(t / this.lifeTime);
                var startY = baseY * LLEAG.easeOutCubic(t / this.lifeTime);
                var color = this.lineColor;
                if (color == null) {
                    var hue = i / this.lineNumber * 2.0;
                    if (hue > 1.0)
                        hue -= 1.0;
                    color = LLEAG.hslToRGB(hue, PLELineSaturation, PLELineLightness);
                }
                var lineWidth = size * this.lineWidthFactor;
                var line = drawer.line(startX, startY, baseX, baseY)
                    .stroke({ color: LLEAG.getHexColor(color), width: lineWidth }).attr("stroke-linecap", "round");
                currentGroup.add(line);
            }
            return currentGroup;
        };
        PopLineEffect.prototype.getLifeTime = function () {
            return this.lifeTime;
        };
        return PopLineEffect;
    }());
    LLEAG.PopLineEffect = PopLineEffect;
})(LLEAG || (LLEAG = {}));
var LLEAG;
(function (LLEAG) {
    LLEAG.kX = 1;
    LLEAG.kY = 4.5;
    LLEAG.vLastY = -20.0;
    LLEAG.defaultX0 = 0.0;
    LLEAG.defaultY0 = -40.0;
    var ParticleBase = (function () {
        function ParticleBase(options) {
            this.x0 = options.x0 || LLEAG.defaultX0;
            this.y0 = options.y0 || LLEAG.defaultY0;
            this.v0X = options.v0X;
            this.v0Y = options.v0Y;
            this.size = options.size;
            this.lifeTime = options.lifeTime;
            this.disappearDurationRate = options.disappearDurationRate;
            this.color = options.color;
            if (!this.checkColorConsistency())
                throw "out of color range";
        }
        ParticleBase.prototype.getBaseXY = function (t) {
            var retP = { x: 0, y: 0 };
            retP.x = (this.v0X / LLEAG.kX) * (1.0 - Math.exp(-LLEAG.kX * t)) + this.x0;
            var c0 = ((this.v0Y - LLEAG.vLastY) / LLEAG.kY);
            retP.y = c0 * (1.0 - Math.exp(-LLEAG.kY * t)) - LLEAG.vLastY * t + this.y0;
            return retP;
        };
        ParticleBase.prototype.checkColorConsistency = function () {
            return this.color.r <= 255 && this.color.g <= 255 && this.color.b <= 255 &&
                this.color.r >= 0 && this.color.g >= 0 && this.color.b >= 0;
        };
        ParticleBase.prototype.calcDisappearingRate = function (t) {
            return (t > this.lifeTime * (1.0 - this.disappearDurationRate)) ? (this.lifeTime - t) / (this.lifeTime * this.disappearDurationRate) : 1.0;
        };
        return ParticleBase;
    }());
    LLEAG.ParticleBase = ParticleBase;
})(LLEAG || (LLEAG = {}));
var LLEAG;
(function (LLEAG) {
    var PSimple = (function (_super) {
        __extends(PSimple, _super);
        function PSimple(options) {
            _super.call(this, options);
            this.vSpinX = options.vSpinX;
            this.vSpinY = options.vSpinY;
            this.vSpinZ = options.vSpinZ;
            this.initSpinZ = options.initSpinZ;
        }
        PSimple.prototype.generateSVGTree = function (t) {
            if (t > this.lifeTime)
                return null;
            var container = document.createElement("div");
            var drawer = SVG(container);
            var path = this.generateParticlePath(drawer);
            var currentGroup = drawer.group().rotate(360.0 * (this.initSpinZ + t * this.vSpinZ)).add(path);
            var disappearingRate;
            if (t > this.lifeTime * (1.0 - this.disappearDurationRate))
                disappearingRate = (this.lifeTime - t) / (this.lifeTime * this.disappearDurationRate);
            else
                disappearingRate = 1.0;
            currentGroup = drawer.group().scale(Math.cos(Math.PI * 2.0 * (this.vSpinY * t)), Math.cos(Math.PI * 2.0 * (this.vSpinX * t)) * disappearingRate).add(currentGroup);
            var translateXY = this.getBaseXY(t);
            currentGroup = drawer.group().translate(translateXY.x, translateXY.y).add(currentGroup);
            return currentGroup;
        };
        return PSimple;
    }(LLEAG.ParticleBase));
    LLEAG.PSimple = PSimple;
})(LLEAG || (LLEAG = {}));
var LLEAG;
(function (LLEAG) {
    var PStarInnerRadiusRate = 0.55;
    var PStar = (function (_super) {
        __extends(PStar, _super);
        function PStar() {
            _super.apply(this, arguments);
        }
        PStar.prototype.generateParticlePath = function (drawer) {
            var pathCommands = "";
            for (var i = 0; i < 5; i++) {
                var x = Math.cos(Math.PI * 2.0 / 5.0 * i) * this.size;
                var y = Math.sin(Math.PI * 2.0 / 5.0 * i) * this.size;
                if (i == 0)
                    pathCommands += "M ";
                else
                    pathCommands += "L ";
                pathCommands += x.toString() + "," + y.toString() + " ";
                x = Math.cos(Math.PI * (2.0 / 5.0 * i + 1.0 / 5.0)) * this.size * PStarInnerRadiusRate;
                y = Math.sin(Math.PI * (2.0 / 5.0 * i + 1.0 / 5.0)) * this.size * PStarInnerRadiusRate;
                pathCommands += "L " + x.toString() + "," + y.toString() + " ";
                if (i == 4)
                    pathCommands += "z";
            }
            return drawer.path(pathCommands).fill(LLEAG.getHexColor(this.color));
        };
        return PStar;
    }(LLEAG.PSimple));
    LLEAG.PStar = PStar;
})(LLEAG || (LLEAG = {}));
var LLEAG;
(function (LLEAG) {
    var PCircle = (function (_super) {
        __extends(PCircle, _super);
        function PCircle() {
            _super.apply(this, arguments);
        }
        PCircle.prototype.generateSVGTree = function (t) {
            if (t > this.lifeTime)
                return null;
            var container = document.createElement("div");
            var drawer = SVG(container);
            var circle = drawer.circle(this.size).translate(-this.size / 2, -this.size / 2).fill(LLEAG.getHexColor(this.color));
            var disappearingRate = this.calcDisappearingRate(t);
            var currentGroup = drawer.group().scale(disappearingRate, disappearingRate).add(circle);
            var translateXY = this.getBaseXY(t);
            return drawer.group().translate(translateXY.x, translateXY.y).add(currentGroup);
        };
        ;
        return PCircle;
    }(LLEAG.ParticleBase));
    LLEAG.PCircle = PCircle;
})(LLEAG || (LLEAG = {}));
var LLEAG;
(function (LLEAG) {
    var PRibbon = (function (_super) {
        __extends(PRibbon, _super);
        function PRibbon(options) {
            _super.call(this, options);
            this.vSpinZ = options.vSpinZ;
            this.initSpinZ = options.initSpinZ;
            this.lineWidth = options.lineWidth;
            this.popLineEffectInstance = options.popLineEffectInstance;
        }
        PRibbon.prototype.generateSVGTree = function (t) {
            if (t > this.lifeTime + this.popLineEffectInstance.getLifeTime())
                return null;
            var container = document.createElement("div");
            var drawer = SVG(container);
            var currentGroup = drawer.group();
            if (t > this.lifeTime) {
                var pleSVGGroup = this.popLineEffectInstance.generateSVGTree(t - this.lifeTime, this.size);
                if (pleSVGGroup == null)
                    return null;
                currentGroup.translate(this.size, 0).add(pleSVGGroup);
                currentGroup = drawer.group().rotate(360.0 * (this.initSpinZ + this.lifeTime * this.vSpinZ)).add(currentGroup);
                var translateXY = this.getBaseXY(this.lifeTime);
                currentGroup = drawer.group().translate(translateXY.x, translateXY.y).add(currentGroup);
            }
            else {
                var arcData = "";
                var disappearingRate = this.calcDisappearingRate(t);
                if (disappearingRate < 1.0) {
                    var startX = Math.cos(Math.PI / 3 * (1.0 - disappearingRate)) * this.size;
                    var startY = Math.sin(Math.PI / 3 * (1.0 - disappearingRate)) * this.size;
                    arcData = "M " + (Math.cos(-Math.PI / 3 * LLEAG.easeInCubic(disappearingRate)) * this.size).toString() + "," + (Math.sin(-Math.PI / 3 * LLEAG.easeInCubic(disappearingRate)) * this.size).toString();
                    arcData += " A " + this.size.toString() + "," + this.size.toString() + " 0 0,1 " + this.size.toString() + ",0";
                }
                else {
                    arcData = "M " + (Math.cos(-Math.PI / 3) * this.size).toString() + "," + (Math.sin(-Math.PI / 3) * this.size).toString();
                    arcData += " A " + this.size.toString() + "," + this.size.toString() + " 0 0,1 " + this.size.toString() + ",0";
                }
                var arc = drawer.path(arcData).stroke({ color: LLEAG.getHexColor(this.color), width: this.lineWidth }).attr("stroke-linecap", "round");
                currentGroup.rotate(360.0 * (this.initSpinZ + t * this.vSpinZ)).add(arc);
                var translateXY = this.getBaseXY(t);
                currentGroup = drawer.group().translate(translateXY.x, translateXY.y).add(currentGroup);
            }
            return currentGroup;
        };
        return PRibbon;
    }(LLEAG.ParticleBase));
    LLEAG.PRibbon = PRibbon;
})(LLEAG || (LLEAG = {}));
var LLEAG;
(function (LLEAG) {
    var PStarInnerRadiusRate = 0.55;
    var PSquare = (function (_super) {
        __extends(PSquare, _super);
        function PSquare() {
            _super.apply(this, arguments);
        }
        PSquare.prototype.generateParticlePath = function (drawer) {
            var pathCommands = "";
            pathCommands += "M " + (-this.size).toString() + "," + (this.size).toString();
            pathCommands += " L " + (this.size).toString() + "," + (this.size).toString();
            pathCommands += " L " + (this.size).toString() + "," + (-this.size).toString();
            pathCommands += " L " + (-this.size).toString() + "," + (-this.size).toString() + " z";
            return drawer.path(pathCommands).fill(LLEAG.getHexColor(this.color));
        };
        return PSquare;
    }(LLEAG.PSimple));
    LLEAG.PSquare = PSquare;
})(LLEAG || (LLEAG = {}));
var LLEAG;
(function (LLEAG) {
    var PStarInnerRadiusRate = 0.55;
    var PTriangle = (function (_super) {
        __extends(PTriangle, _super);
        function PTriangle() {
            _super.apply(this, arguments);
        }
        PTriangle.prototype.generateParticlePath = function (drawer) {
            var pathCommands = "";
            for (var i = 0; i < 3; i++) {
                var x = Math.cos(Math.PI * 2 / 3 * i) * this.size;
                var y = Math.sin(Math.PI * 2 / 3 * i) * this.size;
                if (i == 0)
                    pathCommands += "M ";
                else
                    pathCommands += "L ";
                pathCommands += x.toString() + "," + y.toString();
                if (i == 2)
                    pathCommands += " z";
            }
            return drawer.path(pathCommands).fill(LLEAG.getHexColor(this.color));
        };
        return PTriangle;
    }(LLEAG.PSimple));
    LLEAG.PTriangle = PTriangle;
})(LLEAG || (LLEAG = {}));
var LLEAG;
(function (LLEAG) {
    var PPopCircle = (function (_super) {
        __extends(PPopCircle, _super);
        function PPopCircle() {
            _super.apply(this, arguments);
        }
        PPopCircle.prototype.generateSVGTree = function (t) {
            if (t > this.lifeTime)
                return null;
            var container = document.createElement("div");
            var drawer = SVG(container);
            var pathData = "";
            pathData = 'M 0,-' + this.size + ' A ' + this.size +
                ',' + this.size + ' 0 1,0 0,' + this.size +
                ' A ' + this.size + ',' + this.size +
                ' 0 1,0 0,-' + this.size + ' z';
            var disappearingRate = this.calcDisappearingRate(t);
            if (disappearingRate != 1.0) {
                var radius2 = LLEAG.easeOutCubic(1.0 - disappearingRate) * this.size;
                pathData += ' M 0,-' + radius2 + ' A ' + radius2 + ',' + radius2 + ' 0 1,1 0,' + radius2 + ' A ' + radius2 + ',' + radius2 + ' 0 1,1 0,-' + radius2 + ' z';
            }
            var path = drawer.path(pathData).fill(LLEAG.getHexColor(this.color)).attr("fill-rule", "nonzero");
            var translateXY = this.getBaseXY(t);
            return drawer.group().translate(translateXY.x, translateXY.y).add(path);
        };
        return PPopCircle;
    }(LLEAG.ParticleBase));
    LLEAG.PPopCircle = PPopCircle;
})(LLEAG || (LLEAG = {}));
var LLEAG;
(function (LLEAG) {
    function setAndGetPreset1() {
        LLEAG.kX = 2;
        LLEAG.kY = 4.0;
        LLEAG.vLastY = -18;
        LLEAG.defaultX0 = 0.0;
        LLEAG.defaultY0 = -5.0;
        var ribbonPLEffect = new LLEAG.PopLineEffect({
            lifeTime: 0.5,
            lineWidthFactor: 0.1
        });
        var colorPresets = {
            magenta: {
                r: 0xff, g: 0x20, b: 0x56
            },
            yellow: {
                r: 0xff, g: 0xbb, b: 0x00
            },
            pink: {
                r: 0xff, g: 0x24, b: 0xde
            },
            green: {
                r: 0x50, g: 0xd6, b: 0x00
            },
            blue: {
                r: 0x09, g: 0xa5, b: 0xff
            }
        };
        var pp = [
            new LLEAG.PStar({
                v0X: 34,
                v0Y: -200,
                size: 2.6,
                lifeTime: 1.85,
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.2,
                initSpinZ: 0.1
            }),
            new LLEAG.PStar({
                v0X: -48,
                v0Y: -160,
                size: 2.3,
                lifeTime: 2.1,
                disappearDurationRate: 0.1,
                color: colorPresets.blue,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: -0.3,
                initSpinZ: 0.1
            }),
            new LLEAG.PStar({
                v0X: 24,
                v0Y: -95,
                size: 1.5,
                lifeTime: 1.49,
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.4,
                initSpinZ: 0.1
            }),
            new LLEAG.PSquare({
                v0X: -20,
                v0Y: -190,
                size: 1.8,
                lifeTime: 1.46,
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.2,
                initSpinZ: 0.1
            }),
            new LLEAG.PSquare({
                v0X: -14,
                v0Y: -160,
                size: 1.4,
                lifeTime: 1.61,
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: -0.4,
                initSpinZ: 0.1
            }),
            new LLEAG.PSquare({
                v0X: 30,
                v0Y: -170,
                size: 1.5,
                lifeTime: 1.18,
                disappearDurationRate: 0.1,
                color: colorPresets.blue,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: -0.4,
                initSpinZ: 0.1
            }),
            new LLEAG.PSquare({
                v0X: 22,
                v0Y: -140,
                size: 1.2,
                lifeTime: 1.58,
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.8,
                initSpinZ: 0.1
            }),
            new LLEAG.PSquare({
                v0X: -16,
                v0Y: -115,
                size: 1.0,
                lifeTime: 0.97,
                disappearDurationRate: 1.0,
                color: colorPresets.green,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.6,
                initSpinZ: 0.1
            }),
            new LLEAG.PTriangle({
                v0X: 14,
                v0Y: -166,
                size: 1.5,
                lifeTime: 1.85,
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.3,
                initSpinZ: 0.1
            }),
            new LLEAG.PTriangle({
                v0X: 45,
                v0Y: -165,
                size: 1.3,
                lifeTime: 2.18,
                disappearDurationRate: 0.3,
                color: colorPresets.green,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.6,
                initSpinZ: 0.1
            }),
            new LLEAG.PTriangle({
                v0X: -34,
                v0Y: -115,
                size: 1.0,
                lifeTime: 1.39,
                disappearDurationRate: 0.3,
                color: colorPresets.blue,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: -1.0,
                initSpinZ: 0.1
            }),
            new LLEAG.PCircle({
                v0X: 8,
                v0Y: -135,
                size: 2,
                lifeTime: 1.23,
                disappearDurationRate: 1.0,
                color: colorPresets.yellow
            }),
            new LLEAG.PCircle({
                v0X: -6,
                v0Y: -105,
                size: 1.0,
                lifeTime: 1.76,
                disappearDurationRate: 0.3,
                color: colorPresets.magenta
            }),
            new LLEAG.PPopCircle({
                v0X: 15,
                v0Y: -100,
                size: 2,
                lifeTime: 1.3,
                disappearDurationRate: 1.0,
                color: colorPresets.magenta
            }),
            new LLEAG.PPopCircle({
                v0X: -12,
                v0Y: -135,
                size: 1.2,
                lifeTime: 2.0,
                disappearDurationRate: 0.4,
                color: colorPresets.yellow
            }),
            new LLEAG.PRibbon({
                v0X: 0,
                v0Y: -190,
                size: 3.5,
                lifeTime: 1.85,
                disappearDurationRate: 0.4,
                color: colorPresets.blue,
                vSpinZ: 0.15,
                initSpinZ: -0.08,
                lineWidth: 1.2,
                popLineEffectInstance: ribbonPLEffect,
            }),
            new LLEAG.PRibbon({
                v0X: -28,
                v0Y: -135,
                size: 3.5,
                lifeTime: 1.7,
                disappearDurationRate: 0.2,
                color: colorPresets.magenta,
                vSpinZ: -0.12,
                initSpinZ: -0.12,
                lineWidth: 1.2,
                popLineEffectInstance: ribbonPLEffect,
            }),
            new LLEAG.PRibbon({
                v0X: -17,
                v0Y: -70,
                size: 3.5,
                lifeTime: 1.24,
                disappearDurationRate: 0.5,
                color: colorPresets.magenta,
                vSpinZ: -0.24,
                initSpinZ: -0.0,
                lineWidth: 1.2,
                popLineEffectInstance: ribbonPLEffect,
            }),
            new LLEAG.PRibbon({
                v0X: 26,
                v0Y: -50,
                size: 3.5,
                lifeTime: 1.18,
                disappearDurationRate: 0.2,
                color: colorPresets.yellow,
                vSpinZ: 0.06,
                initSpinZ: -0.15,
                lineWidth: 1.2,
                popLineEffectInstance: ribbonPLEffect,
            }),
        ];
        return pp;
    }
    LLEAG.setAndGetPreset1 = setAndGetPreset1;
})(LLEAG || (LLEAG = {}));
var LLEAG;
(function (LLEAG) {
    var defaultSize = 200;
    function generateLikeGIF10th() {
        var size = parseInt(document.getElementById("generateSize").value);
        if (isNaN(size)) {
            size = defaultSize;
        }
        var trimmingCircle = document.getElementById("trimmingCircle").checked;
        var enableUnpushed = document.getElementById("enableUnpushed").checked;
        var disenableSmooth = document.getElementById("disenableSmooth").checked;
        var frameRateDouble = document.getElementById("frameRateDouble").checked;
        var frameRate = frameRateDouble ? 50.0 : 25.0;
        var iconScaleRate = parseInt(document.getElementById("iconScaleRate").value) / 100.0;
        if (isNaN(iconScaleRate)) {
            iconScaleRate = 0.6;
        }
        var illustPriorQuantize = document.getElementById("illustPriorQuantize").checked;
        ;
        var iconImg = document.getElementById("iconImg");
        if (iconImg == null) {
            alert("アイコンに使用する画像が読み込まれていません。");
            return;
        }
        if (trimmingCircle)
            iconImg = getTrimmedIconCanvas(iconImg);
        var unpushedIcon = undefined;
        if (enableUnpushed) {
            unpushedIcon = getMonochromeIconCanvas(iconImg, 0.7);
            unpushedIcon = getCenterScaledCanvas(unpushedIcon, size, iconScaleRate, disenableSmooth, 0, size / 6);
            unpushedIcon = getWhiteBackgroundCanvas(unpushedIcon);
        }
        var canvases = [];
        var svgXMLStringsPLE = [];
        var svgXMLStringsParticle = [];
        var particlePreset = LLEAG.setAndGetPreset1();
        var drawer = SVG(document.createElement("div"));
        drawer.viewbox(-30, -40, 60, 60).size(size, size);
        var appearingPLEffect = new LLEAG.PopLineEffect({
            lifeTime: 0.8,
            lineWidthFactor: 0.05
        });
        var maxIndex = 3 * frameRate;
        for (var idx = 1; idx <= maxIndex; idx++) {
            var svgGroup = appearingPLEffect.generateSVGTree(idx / frameRate, 20);
            var canvasBlockPLE = null;
            if (svgGroup != null) {
                drawer.clear();
                svgGroup = drawer.group().add(svgGroup);
                svgXMLStringsPLE.push(drawer.svg());
                canvasBlockPLE = generateCanvasFromSVG(drawer.svg(), size);
            }
            drawer.clear();
            svgGroup = drawer.group();
            for (var poIndex = 0; poIndex < particlePreset.length; poIndex++) {
                var particleSVGGroup = particlePreset[poIndex].generateSVGTree(idx / frameRate);
                if (particleSVGGroup != null) {
                    drawer.group().add(particleSVGGroup);
                }
            }
            svgXMLStringsParticle.push(drawer.svg());
            var canvasBlockParticle = generateCanvasFromSVG(drawer.svg(), size);
            var canvasBlockIcon = document.createElement('canvas');
            canvasBlockIcon.width = size;
            canvasBlockIcon.height = size;
            generateIconAnimationOnCanvas(idx / frameRate, canvasBlockIcon, iconImg, disenableSmooth, iconScaleRate);
            var canvasBlock = document.createElement("canvas");
            canvasBlock.width = size;
            canvasBlock.height = size;
            var canvasBlockCtx = canvasBlock.getContext("2d");
            canvasBlockCtx.fillStyle = "#FFF";
            canvasBlockCtx.fillRect(0, 0, size, size);
            if (canvasBlockPLE != null)
                canvasBlockCtx.drawImage(canvasBlockPLE, 0, 0);
            canvasBlockCtx.drawImage(canvasBlockIcon, 0, 0);
            canvasBlockCtx.drawImage(canvasBlockParticle, 0, 0);
            canvasBlockCtx = null;
            canvasBlockPLE = null;
            canvasBlockParticle = null;
            canvasBlockIcon = null;
            canvases.push(canvasBlock);
            console.log("generating...");
        }
        var sampleFrame = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,];
        if (illustPriorQuantize)
            sampleFrame = [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 70, 70, 70, 70, 70, 70];
        if (frameRateDouble) {
            for (var sfIndex = 0; sfIndex < sampleFrame.length; sfIndex++) {
                sampleFrame[sfIndex] = sampleFrame[sfIndex] * 2;
            }
        }
        if (enableUnpushed) {
            var tempArray = [0];
            for (var sfIndex = 0; sfIndex < sampleFrame.length; sfIndex++) {
                tempArray.push(sampleFrame[sfIndex] + Math.round(frameRate * 0.6));
            }
            sampleFrame = tempArray;
            for (var upIndex = 0; upIndex < 30; upIndex++) {
                canvases.unshift(unpushedIcon);
            }
        }
        var imageDataArray = [];
        for (var idaIndex = 0; idaIndex < canvases.length; idaIndex++) {
            imageDataArray.push(canvases[idaIndex].getContext('2d').getImageData(0, 0, size, size).data);
        }
        legWorker.postMessage({
            command: "encode",
            nFrames: imageDataArray.length,
            height: size,
            width: size,
            frameRate: frameRate,
            quality: 10,
            gpFrameIndexArray: sampleFrame,
            imageDataArray: imageDataArray
        });
        var imDataURLArray = [];
        for (var iduIndex = 0; iduIndex < canvases.length; iduIndex++) {
            imDataURLArray.push(canvases[iduIndex].toDataURL().replace("data:image/png;base64,", ""));
        }
        zipWorker.postMessage({
            command: "package",
            dataArray: imDataURLArray,
            svgSourceArray: null
        });
        document.getElementById('progressBlock').setAttribute("style", "display: inline;");
        document.getElementById('progressBar').setAttribute("value", "0");
        document.getElementById('progressMessage').innerHTML = "GIFエンコード中...";
    }
    LLEAG.generateLikeGIF10th = generateLikeGIF10th;
    function generateIconAnimationOnCanvas(t, canvasBlock, iconImg, disenableSmooth, scaleRate) {
        var imgWidth = iconImg.naturalWidth || iconImg.width;
        var imgHeight = iconImg.naturalHeight || iconImg.height;
        var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;
        var canvasSize = canvasBlock.width;
        var baseRadius = canvasSize * scaleRate / 2;
        var period = 0.4;
        var jumpY = 0;
        var upperJumpFactor = 0.12;
        var downerJumpFactor = 1;
        var context = canvasBlock.getContext('2d');
        if (disenableSmooth) {
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;
        }
        var dw = 1.0 * imgWidth / imgLongEdge * baseRadius * 2.0;
        var dh = 1.0 * imgHeight / imgLongEdge * baseRadius * 2.0;
        if (t < period) {
            var jumpRealT = t - period / 2;
            var jumpT = jumpRealT * 4 / period;
            jumpY = (jumpT * jumpT - 4) * dh * upperJumpFactor;
        }
        else if (t >= period && t < period * 2) {
            var jumpT = t - period / 2 * 3;
            jumpY = -(jumpT * jumpT - (period * period / 4)) * dh * downerJumpFactor;
        }
        var dx = (canvasSize - dw) / 2.0;
        var dy = canvasSize / 3 * 2 - dh / 2 + jumpY;
        context.drawImage(iconImg, 0, 0, imgWidth, imgHeight, dx, dy, dw, dh);
    }
    LLEAG.generateIconAnimationOnCanvas = generateIconAnimationOnCanvas;
    function confirmImageSize() {
        var kSVGNS = 'http://www.w3.org/2000/svg';
        var size = parseInt(document.getElementById('generateSize').value);
        if (isNaN(size)) {
            alert("サイズは半角数字のみで入力して下さい。");
            return false;
        }
        var svgBlock = document.createElementNS(kSVGNS, 'svg');
        svgBlock.setAttribute('width', size.toString());
        svgBlock.setAttribute('height', size.toString());
        svgBlock.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
        svgBlock.setAttribute('xmlns', kSVGNS);
        svgBlock.setAttribute('version', '1.1');
        var rectBlock = document.createElementNS(kSVGNS, 'rect');
        rectBlock.setAttribute('x', '0');
        rectBlock.setAttribute('y', '0');
        rectBlock.setAttribute('width', size.toString());
        rectBlock.setAttribute('height', size.toString());
        rectBlock.setAttribute('stroke', '#CCC');
        rectBlock.setAttribute('stroke-width', '4');
        rectBlock.setAttribute('fill', 'none');
        svgBlock.appendChild(rectBlock);
        var textBlock = document.createElementNS(kSVGNS, 'text');
        textBlock.setAttribute('x', (size / 2).toString());
        textBlock.setAttribute('y', (size / 2).toString());
        textBlock.setAttribute('text-anchor', 'middle');
        textBlock.setAttribute('font-family', 'sans-serif');
        textBlock.setAttribute('font-size', '20');
        textBlock.setAttribute('fill', '#CCC');
        textBlock.innerHTML = size.toString() + ' x ' + size.toString();
        svgBlock.appendChild(textBlock);
        var tempBlock = document.createElement('span');
        tempBlock.appendChild(svgBlock);
        var canvasBlock = generateCanvasFromSVG(tempBlock.innerHTML, size);
        var targetImgBlock = document.getElementById('targetImg');
        targetImgBlock.src = canvasBlock.toDataURL();
        targetImgBlock.setAttribute("style", "display: block;");
    }
    LLEAG.confirmImageSize = confirmImageSize;
    function getTrimmedIconCanvas(imgBlock) {
        var imgLongEdge = imgBlock.naturalWidth > imgBlock.naturalHeight ? imgBlock.naturalWidth : imgBlock.naturalHeight;
        var imgEditCanvas = document.createElement('canvas');
        imgEditCanvas.width = imgLongEdge;
        imgEditCanvas.height = imgLongEdge;
        var imgEditCanvasContext = imgEditCanvas.getContext('2d');
        imgEditCanvasContext.beginPath();
        imgEditCanvasContext.arc(imgLongEdge / 2, imgLongEdge / 2, imgLongEdge / 2, 0, 2 * Math.PI);
        imgEditCanvasContext.closePath();
        imgEditCanvasContext.clip();
        imgEditCanvasContext.drawImage(imgBlock, (imgLongEdge - imgBlock.naturalWidth) / 2, (imgLongEdge - imgBlock.naturalHeight) / 2);
        return imgEditCanvas;
    }
    LLEAG.getTrimmedIconCanvas = getTrimmedIconCanvas;
    function getMonochromeIconCanvas(imgBlock, brightnessFactor) {
        var imgWidth = imgBlock.naturalWidth || imgBlock.width;
        var imgHeight = imgBlock.naturalHeight || imgBlock.height;
        var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;
        var retCanvas = document.createElement('canvas');
        retCanvas.width = imgLongEdge;
        retCanvas.height = imgLongEdge;
        var ctx = retCanvas.getContext("2d");
        ctx.drawImage(imgBlock, (imgLongEdge - imgWidth) / 2, (imgLongEdge - imgHeight) / 2);
        var image = ctx.getImageData(0, 0, imgLongEdge, imgLongEdge);
        var i = image.data.length;
        var c = 255.0 * brightnessFactor;
        for (var iIndex = 0; iIndex < i; iIndex += 4) {
            image.data[iIndex] = image.data[iIndex + 1] = image.data[iIndex + 2] = Math.round(c);
        }
        ctx.clearRect(0, 0, imgLongEdge, imgLongEdge);
        ctx.putImageData(image, 0, 0);
        return retCanvas;
    }
    LLEAG.getMonochromeIconCanvas = getMonochromeIconCanvas;
    function getCenterScaledCanvas(imgBlock, size, scale, disenableSmooth, cx, cy) {
        var retCanvas = document.createElement('canvas');
        retCanvas.width = retCanvas.height = size;
        var imgWidth = imgBlock.naturalWidth || imgBlock.width;
        var imgHeight = imgBlock.naturalHeight || imgBlock.height;
        var imgLongEdge = imgWidth > imgHeight ? imgWidth : imgHeight;
        var dw = imgWidth / imgLongEdge * size * scale;
        var dh = imgHeight / imgLongEdge * size * scale;
        cx = cx || 0;
        cy = cy || 0;
        var dx = (size - dw) / 2.0 + cx;
        var dy = (size - dh) / 2.0 + cy;
        var context = retCanvas.getContext('2d');
        if (disenableSmooth) {
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;
        }
        context.drawImage(imgBlock, 0, 0, imgWidth, imgHeight, dx, dy, dw, dh);
        return retCanvas;
    }
    LLEAG.getCenterScaledCanvas = getCenterScaledCanvas;
    function getWhiteBackgroundCanvas(imgBlock) {
        var imgWidth = imgBlock.naturalWidth || imgBlock.width;
        var imgHeight = imgBlock.naturalHeight || imgBlock.height;
        var retCanvas = document.createElement('canvas');
        retCanvas.width = imgWidth;
        retCanvas.height = imgHeight;
        var ctx = retCanvas.getContext('2d');
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, imgWidth, imgHeight);
        ctx.drawImage(imgBlock, 0, 0);
        return retCanvas;
    }
    LLEAG.getWhiteBackgroundCanvas = getWhiteBackgroundCanvas;
    function generateCanvasFromSVG(svgSource, size) {
        var ret = document.createElement('canvas');
        ret.width = size;
        ret.height = size;
        canvg(ret, svgSource, { useCORS: true });
        return ret;
    }
    LLEAG.generateCanvasFromSVG = generateCanvasFromSVG;
})(LLEAG || (LLEAG = {}));
