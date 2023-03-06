import { saveText } from './Util.js';

class Render {
    width;
    height;
    aspectRatio;

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.aspectRatio = width / height;
    }

    draw() {
        throw new Error('Not implemented');
    }

    clear(color) {
        throw new Error('Not implemented');
    }

    setPixel(x, y, color) {
        throw new Error('Not implemented');
    }
}

export class PpmRender extends Render {
    data = [];

    constructor(width, height) {
        super(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.data.push(new Color(0, 0, 0));
            }
        }
    }

    draw() {
        let result = `P3 ${this.width} ${this.height} 255`;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let color = this.data[x + (y * this.width)];
                result += `\n${Math.floor(color.r * 255)} ${Math.floor(color.g * 255)} ${Math.floor(color.b * 255)}`;
            }
        }

        saveText('image.ppm', result);
        return result;
    }

    clear(color) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.setPixel(x, y, color);
            }
        }
    }

    setPixel(x, y, color) {
        this.data[x + (y * this.width)] = color;
    }
}

export class CanvasRender extends Render {
    canvas;
    ctx;
    imageData;

    constructor(canvas) {
        super(canvas.width, canvas.height);

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.imageData = this.ctx.createImageData(canvas.width, canvas.height);
    }

    draw() {
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    clear(color) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.setPixel(x, y, color);
            }
        }
    }

    setPixel(x, y, color) {
        let index = (x + (y * this.width)) * 4;
        this.imageData.data[index + 0] = color[0];
        this.imageData.data[index + 1] = color[1];
        this.imageData.data[index + 2] = color[2];
        this.imageData.data[index + 3] = 255;
    }
}
