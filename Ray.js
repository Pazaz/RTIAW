import { vec3 } from './gl-matrix.js';
import { HitRecord } from './Hittable.js';

export class Ray {
    origin;
    direction;
    time;

    constructor(origin, direction, time = 0.0) {
        this.origin = origin;
        this.direction = direction;
        this.time = time;
    }

    at(t) {
        return vec3.add(vec3.create(), this.origin, vec3.scale(vec3.create(), this.direction, t));
    }
}

export function rayColor(r, world, depth) {
    if (depth <= 0) {
        return vec3.fromValues(0, 0, 0);
    }

    let rec = new HitRecord();
    if (world.hit(r, 0.001, Infinity, rec)) {
        let scattered = new Ray();
        let attenuation = vec3.create();

        if (rec.material.scatter(r, rec, attenuation, scattered)) {
            return vec3.mul(vec3.create(), attenuation, rayColor(scattered, world, depth - 1));
        }

        return vec3.fromValues(0, 0, 0);
    }

    // draw sky
    let unitDirection = vec3.normalize(vec3.create(), r.direction);
    let t = 0.5 * (unitDirection[1] + 1.0);
    return vec3.add(vec3.create(), vec3.scale(vec3.create(), vec3.fromValues(1.0, 1.0, 1.0), 1.0 - t), vec3.scale(vec3.create(), vec3.fromValues(0.5, 0.7, 1.0), t));
}
