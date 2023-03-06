import { Vec3, Color } from './Vec3.js';
import { Ray } from './Ray.js';

export class Material {
    scatter(r, rec, attenuation, scattered) { }
}

export class Lambertian extends Material {
    albedo;

    constructor(a) {
        super();

        this.albedo = a;
    }

    scatter(r, rec) {
        let scatterDirection = rec.normal.add(Vec3.randomUnitVector());

        if (scatterDirection.nearZero()) {
            scatterDirection = rec.normal;
        }

        let scattered = new Ray(rec.p, scatterDirection);
        let attenuation = this.albedo;
        return { scattered, attenuation };
    }
}

export class Metal extends Material {
    albedo;
    fuzz;

    constructor(a, f = 0.0) {
        super();

        this.albedo = a;
        this.fuzz = f < 1 ? f : 1;
    }

    scatter(r, rec) {
        let reflected = Vec3.reflect(r.dir.unitVector(), rec.normal);
        let scattered = new Ray(rec.p, reflected.add(Vec3.randomInUnitSphere().mulScalar(this.fuzz)));
        let attenuation = this.albedo;
        return { scattered, attenuation };
    }
}

export class Dielectric extends Material {
    refIdx;

    constructor(ri) {
        super();

        this.refIdx = ri;
    }

    scatter(r, rec) {
        let attenuation = new Color(1.0, 1.0, 1.0);
        let refractionRatio = rec.frontFace ? (1.0 / this.refIdx) : this.refIdx;

        let unitDirection = r.dir.unitVector();
        let cosTheta = Math.min(-unitDirection.dot(rec.normal), 1.0);
        let sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta);

        let cannotRefract = refractionRatio * sinTheta > 1.0;
        let direction;

        if (cannotRefract || this.reflectance(cosTheta, refractionRatio) > Math.random()) {
            direction = Vec3.reflect(unitDirection, rec.normal);
        } else {
            direction = Vec3.refract(unitDirection, rec.normal, refractionRatio);
        }

        let scattered = new Ray(rec.p, direction);
        return { scattered, attenuation };
    }

    reflectance(cosine, refIdx) {
        let r0 = (1 - refIdx) / (1 + refIdx);
        r0 = r0 * r0;
        return r0 + (1 - r0) * Math.pow((1 - cosine), 5);
    }
}
