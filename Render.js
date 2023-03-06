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
        this.imageData.data[index + 0] = color.r() * 255.99;
        this.imageData.data[index + 1] = color.g() * 255.99;
        this.imageData.data[index + 2] = color.b() * 255.99;
        this.imageData.data[index + 3] = 255;
    }
}
