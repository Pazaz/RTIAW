import { vec3 } from './gl-matrix.js';
import { degreesToRadians, random, randomInUnitDisk } from './Util.js';
import { Ray } from './Ray.js';

export class Camera {
    origin;
    lowerLeftCorner;
    horizontal;
    vertical;
    u;
    v;
    w;
    lensRadius;
    time0;
    time1;

    constructor(lookFrom, lookAt, vUp, vFov, aspectRatio, aperture, focusDistance, time0 = 0.0, time1 = 0.0) {
        let theta = degreesToRadians(vFov);
        let h = Math.tan(theta / 2.0);
        let viewportHeight = 2.0 * h;
        let viewportWidth = aspectRatio * viewportHeight;

        this.w = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), lookFrom, lookAt));
        this.u = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), vUp, this.w));
        this.v = vec3.cross(vec3.create(), this.w, this.u);

        this.origin = lookFrom;
        this.horizontal = vec3.scale(vec3.create(), this.u, viewportWidth * focusDistance);
        this.vertical = vec3.scale(vec3.create(), this.v, viewportHeight * focusDistance);

        let step1 = vec3.scale(vec3.create(), this.horizontal, 0.5);
        let step2 = vec3.scale(vec3.create(), this.vertical, 0.5);
        let step3 = vec3.sub(vec3.create(), this.origin, step1);
        let step4 = vec3.sub(vec3.create(), step3, step2);
        this.lowerLeftCorner = vec3.sub(vec3.create(), step4, vec3.scale(vec3.create(), this.w, focusDistance));

        this.lensRadius = aperture / 2.0;

        this.time0 = time0;
        this.time1 = time1;
    }

    getRay(s, t) {
        let rd = vec3.scale(vec3.create(), randomInUnitDisk(), this.lensRadius);
        let offset = vec3.add(vec3.create(), vec3.scale(vec3.create(), this.u, rd[0]), vec3.scale(vec3.create(), this.v, rd[1]));

        let step1 = vec3.scale(vec3.create(), this.horizontal, s);
        let step2 = vec3.scale(vec3.create(), this.vertical, t);
        let step3 = vec3.add(vec3.create(), this.lowerLeftCorner, step1);
        let step4 = vec3.add(vec3.create(), step3, step2);
        let step5 = vec3.sub(vec3.create(), step4, this.origin);

        return new Ray(
            vec3.add(vec3.create(), this.origin, offset),
            vec3.sub(vec3.create(), step5, offset),
            random(this.time0, this.time1)
        );
    }
}
