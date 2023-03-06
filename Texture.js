import { vec3 } from './gl-matrix.js';
import { Perlin } from './Perlin.js';

export class Texture {
    value(u, v, p) {
        return vec3.create();
    }
}

export class SolidColor {
    color;

    constructor(color) {
        this.color = color;
    }

    value(u, v, p) {
        return this.color;
    }
}

export class CheckerTexture extends Texture {
    odd;
    even;

    constructor(odd, even) {
        super();

        this.odd = odd;
        this.even = even;
    }

    value(u, v, p) {
        let sines = Math.sin(10 * p[0]) * Math.sin(10 * p[1]) * Math.sin(10 * p[2]);
        if (sines < 0) {
            return this.odd.value(u, v, p);
        } else {
            return this.even.value(u, v, p);
        }
    }
}

export class NoiseTexture extends Texture {
    scale;

    constructor(scale) {
        super();

        this.scale = scale;
    }

    value(u, v, p) {
        // return vec3.scale(vec3.create(), vec3.fromValues(1, 1, 1), Perlin.turb(vec3.scale(vec3.create(), p, this.scale)));
        return vec3.scale(vec3.create(), vec3.fromValues(1, 1, 1), 0.5 * (1 + Math.sin(this.scale * p[2] + 10 * Perlin.turb(p))));
    }
}
