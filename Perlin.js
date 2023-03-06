import { vec3 } from './gl-matrix.js';

export class Perlin {
    static ranVec = [];
    static permX = [];
    static permY = [];
    static permZ = [];

    static {
        for (let i = 0; i < 256; i++) {
            Perlin.ranVec[i] = vec3.fromValues(-1 + 2 * Math.random(), -1 + 2 * Math.random(), -1 + 2 * Math.random());
        }

        Perlin.permX = Perlin.generatePerm();
        Perlin.permY = Perlin.generatePerm();
        Perlin.permZ = Perlin.generatePerm();
    }

    static generatePerm() {
        let p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        Perlin.permute(p, 256);
        
        return p;
    }

    static permute(p, n) {
        for (let i = n - 1; i > 0; i--) {
            let target = Math.floor(Math.random() * (i + 1));
            let tmp = p[i];
            p[i] = p[target];
            p[target] = tmp;
        }
    }

    static noise(p) {
        let u = p[0] - Math.floor(p[0]);
        let v = p[1] - Math.floor(p[1]);
        let w = p[2] - Math.floor(p[2]);

        u = u * u * (3 - 2 * u);
        v = v * v * (3 - 2 * v);
        w = w * w * (3 - 2 * w);

        let i = Math.floor(p[0]);
        let j = Math.floor(p[1]);
        let k = Math.floor(p[2]);

        let c = [];
        for (let di = 0; di < 2; di++) {
            c[di] = [];

            for (let dj = 0; dj < 2; dj++) {
                c[di][dj] = [];

                for (let dk = 0; dk < 2; dk++) {
                    c[di][dj][dk] = Perlin.ranVec[
                        Perlin.permX[(i + di) & 255] ^
                        Perlin.permY[(j + dj) & 255] ^
                        Perlin.permZ[(k + dk) & 255]
                    ];
                }
            }
        }

        return Perlin.trilinearInterp(c, u, v, w);
    }

    static trilinearInterp(c, u, v, w) {
        let uu = u * u * (3 - 2 * u);
        let vv = v * v * (3 - 2 * v);
        let ww = w * w * (3 - 2 * w);
        let accum = 0.0;

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                for (let k = 0; k < 2; k++) {
                    let weightV = vec3.fromValues(u - i, v - j, w - k);
                    accum += (i * uu + (1 - i) * (1 - uu)) *
                             (j * vv + (1 - j) * (1 - vv)) *
                             (k * ww + (1 - k) * (1 - ww)) *
                             vec3.dot(c[i][j][k], weightV);
                }
            }
        }

        return accum;
    }

    static turb(p, depth = 7) {
        let accum = 0.0;
        let tempP = vec3.create();
        let weight = 1.0;

        for (let i = 0; i < depth; i++) {
            vec3.copy(tempP, p);
            accum += weight * Perlin.noise(tempP);
            weight *= 0.5;
            vec3.scale(p, p, 2);
        }

        return Math.abs(accum);
    }
}
