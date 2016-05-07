/// <reference path="./Structures.ts"/>
/// <reference path="./Utils.ts"/>
/// <reference path="./PopLineEffect.ts"/>
/// <reference path="./ParticleBase.ts"/>
/// <reference path="./PStar.ts"/>
/// <reference path="./PCircle.ts"/>
/// <reference path="./PRibbon.ts"/>
/// <reference path="./PSquare.ts"/>
/// <reference path="./PTriangle.ts"/>
/// <reference path="./PPopCircle.ts"/>

namespace LLEAG {

    export function setAndGetPreset1(): Array<ParticleBase>{
        // set physical constants
        kX = 2;
        kY = 4.0;
        vLastY = -18;
        //g = kY * -vLastY;
        defaultX0 = 0.0;
        defaultY0 = -5.0;

        // create particle presets
        let ribbonPLEffect = new PopLineEffect({
            lifeTime: 0.5,
            lineWidthFactor: 0.1
        });
        let colorPresets = {
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
        }
        let pp = [
            // PStar
            new PStar({
                v0X: 34,
                v0Y: -200,
                size: 2.6,
                lifeTime: 1.85, // (73 - 12) / 33 ~= 1.85
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.2,
                initSpinZ: 0.1
            }),
            new PStar({
                v0X: -48,
                v0Y: -160,
                size: 2.3,
                lifeTime: 2.1, // (81 - 12) / 33 ~= 2.10
                disappearDurationRate: 0.1,
                color: colorPresets.blue,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: -0.3,
                initSpinZ: 0.1
            }),
            new PStar({
                v0X: 24,
                v0Y: -95,
                size: 1.5,
                lifeTime: 1.49, // (61 - 12) / 33 ~= 1.49
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.4,
                initSpinZ: 0.1
            }),
            // PSquare
            new PSquare({
                v0X: -20,
                v0Y: -190,
                size: 1.8,
                lifeTime: 1.46, // (60 - 12) / 33 ~= 1.46
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.2,
                initSpinZ: 0.1
            }),
            new PSquare({
                v0X: -14,
                v0Y: -160,
                size: 1.4,
                lifeTime: 1.61, // (65 - 12) / 33 ~= 1.61
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: -0.4,
                initSpinZ: 0.1
            }),
            new PSquare({
                v0X: 30,
                v0Y: -170,
                size: 1.5,
                lifeTime: 1.18, // (51 - 12) / 33 ~= 1.18
                disappearDurationRate: 0.1,
                color: colorPresets.blue,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: -0.4,
                initSpinZ: 0.1
            }),
            new PSquare({
                v0X: 22,
                v0Y: -140,
                size: 1.2,
                lifeTime: 1.58, // (64 - 12) / 33 ~= 1.58
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.8,
                initSpinZ: 0.1
            }),
            new PSquare({
                v0X: -16,
                v0Y: -115,
                size: 1.0,
                lifeTime: 0.97, // (44 - 12) / 33 ~= 0.97
                disappearDurationRate: 1.0,
                color: colorPresets.green,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.6,
                initSpinZ: 0.1
            }),
            // PTriangle
            new PTriangle({
                v0X: 14,
                v0Y: -166,
                size: 1.5,
                lifeTime: 1.85, // (73 - 12) / 33 ~= 1.85
                disappearDurationRate: 0.1,
                color: colorPresets.magenta,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.3,
                initSpinZ: 0.1
            }),
            new PTriangle({
                v0X: 45,
                v0Y: -165,
                size: 1.3,
                lifeTime: 2.18, // (84 - 12) / 33 ~= 2.18
                disappearDurationRate: 0.3,
                color: colorPresets.green,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: 0.6,
                initSpinZ: 0.1
            }),
            new PTriangle({
                v0X: -34,
                v0Y: -115,
                size: 1.0,
                lifeTime: 1.39, // (58 - 12) / 33 ~= 1.39
                disappearDurationRate: 0.3,
                color: colorPresets.blue,
                vSpinX: 0,
                vSpinY: 0,
                vSpinZ: -1.0,
                initSpinZ: 0.1
            }),
            // PCircle
            new PCircle({
                v0X: 8,
                v0Y: -135,
                size: 2,
                lifeTime: 1.23, // (49 - 12) / 33 ~= 1.12
                disappearDurationRate: 1.0,
                color: colorPresets.yellow
            }),
            new PCircle({
                v0X: -6,
                v0Y: -105,
                size: 1.0,
                lifeTime: 1.76, // (70 - 12) / 33 ~= 1.76
                disappearDurationRate: 0.3,
                color: colorPresets.magenta
            }),
            // PPopCircle
            new PPopCircle({
                v0X: 15,
                v0Y: -100,
                size: 2,
                lifeTime: 1.3,
                disappearDurationRate: 1.0,
                color: colorPresets.magenta
            }),
            new PPopCircle({
                v0X: -12,
                v0Y: -135,
                size: 1.2,
                lifeTime: 2.0,
                disappearDurationRate: 0.4,
                color: colorPresets.yellow
            }),
            // PRibbon
            new PRibbon({
                v0X: 0,
                v0Y: -190,
                size: 3.5,
                lifeTime: 1.85, // (73 - 12) / 33 ~= 1.85
                disappearDurationRate: 0.4,
                color: colorPresets.blue,
                vSpinZ: 0.15,
                initSpinZ: -0.08,
                lineWidth: 1.2,
                popLineEffectInstance: ribbonPLEffect,
            }),
            new PRibbon({
                v0X: -28,
                v0Y: -135,
                size: 3.5,
                lifeTime: 1.7, // (68 - 12) / 33 ~= 1.70
                disappearDurationRate: 0.2,
                color: colorPresets.magenta,
                vSpinZ: -0.12,
                initSpinZ: -0.12,
                lineWidth: 1.2,
                popLineEffectInstance: ribbonPLEffect,
            }),
            new PRibbon({
                v0X: -17,
                v0Y: -70,
                size: 3.5,
                lifeTime: 1.24, // (53 - 12) / 33 ~= 1.24
                disappearDurationRate: 0.5,
                color: colorPresets.magenta,
                vSpinZ: -0.24,
                initSpinZ: -0.0,
                lineWidth: 1.2,
                popLineEffectInstance: ribbonPLEffect,
            }),
            new PRibbon({
                v0X: 26,
                v0Y: -50,
                size: 3.5,
                lifeTime: 1.18, // (51 - 12) / 33 ~= 1.18
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
}
