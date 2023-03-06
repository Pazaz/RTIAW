import { Color } from './Vec3.js';

export class Ray {
    orig;
    dir;

    constructor(origin, direction) {
        this.orig = origin;
        this.dir = direction;
    }

    at(t) {
        return this.orig.add(this.dir.mulScalar(t));
    }
}

export function rayColor(r, world, depth) {
    if (depth <= 0) {
        return new Color(0, 0, 0);
    }

    let hitResult = world.hit(r, 0.001, Infinity);
    if (hitResult.hitAnything) {
        let rec = hitResult.rec;

        let scatterResult = rec.material.scatter(r, rec);
        if (scatterResult) {
            let { attenuation, scattered } = scatterResult;
            return attenuation.mul(rayColor(scattered, world, depth - 1));
        }

        return new Color(0, 0, 0);
    }

    let unitDirection = r.dir.unitVector();
    let t = 0.5 * (unitDirection.y() + 1.0);
    return new Color(1.0, 1.0, 1.0).mulScalar(1.0 - t).add(new Color(0.5, 0.7, 1.0).mulScalar(t));
}
