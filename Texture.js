import { vec3 } from './gl-matrix.js';

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
