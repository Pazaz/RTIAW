import { degreesToRadians } from './Util.js';
import { Vec3 } from './Vec3.js';
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

    constructor(lookFrom, lookAt, vup, vfov, aspectRatio, aperture, focusDist) {
        let theta = degreesToRadians(vfov);
        let h = Math.tan(theta / 2);
        let viewportHeight = 2.0 * h;
        let viewportWidth = aspectRatio * viewportHeight;

        this.w = lookFrom.sub(lookAt).unitVector();
        this.u = vup.cross(this.w).unitVector();
        this.v = this.w.cross(this.u);

        this.origin = lookFrom;
        this.horizontal = this.u.mulScalar(viewportWidth * focusDist);
        this.vertical = this.v.mulScalar(viewportHeight * focusDist);
        this.lowerLeftCorner = this.origin.sub(this.horizontal.divScalar(2)).sub(this.vertical.divScalar(2)).sub(this.w.mulScalar(focusDist));

        this.lensRadius = aperture / 2;
    }

    getRay(s, t) {
        let rd = Vec3.randomInUnitDisk().mulScalar(this.lensRadius);
        let offset = this.u.mulScalar(rd.x()).add(this.v.mulScalar(rd.y()));

        return new Ray(
            this.origin.add(offset),
            this.lowerLeftCorner.add(this.horizontal.mulScalar(s)).add(this.vertical.mulScalar(t)).sub(this.origin).sub(offset)
        );
    }
}
