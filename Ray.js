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

export function rayColor(r, background, world, depth) {
    if (depth <= 0) {
        return vec3.create();
    }

    let rec = new HitRecord();
    if (!world.hit(r, 0.001, Infinity, rec)) {
        return background;
    }

    let scattered = new Ray();
    let attenuation = vec3.create();

    if (rec.material.scatter(r, rec, attenuation, scattered)) {
        return vec3.mul(vec3.create(), attenuation, rayColor(scattered, background, world, depth - 1));
    }

    return vec3.create();
}
