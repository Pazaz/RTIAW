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

export class ImageTexture extends Texture {
    data;
    width;
    height;
    bytesPerScanline;

    constructor(data, width, height, bytesPerScanline) {
        super();

        this.data = data;
        this.width = width;
        this.height = height;
        this.bytesPerScanline = bytesPerScanline;
    }

    static async load(url) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.onload = () => {
                let canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                let context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);
                let imageData = context.getImageData(0, 0, image.width, image.height);
                let data = new Uint8Array(imageData.data.buffer);
                resolve(new ImageTexture(data, image.width, image.height, image.width * 4));
            };
            image.onerror = reject;
            image.src = url;
        });
    }

    value(u, v, p) {
        if (!this.data) {
            return vec3.fromValues(0, 1, 1);
        }

        u = Math.max(0, Math.min(1, u));
        v = 1.0 - Math.max(0, Math.min(1, v));

        let i = Math.floor(u * this.width);
        let j = Math.floor(v * this.height);

        if (i >= this.width) {
            i = this.width - 1;
        }

        if (j >= this.height) {
            j = this.height - 1;
        }

        let colorScale = 1.0 / 255.0;
        let pixel = (j * this.bytesPerScanline) + i * 4;

        return vec3.fromValues(
            this.data[pixel] * colorScale,
            this.data[pixel + 1] * colorScale,
            this.data[pixel + 2] * colorScale
        );
    }
}
