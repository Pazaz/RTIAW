import { vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm';
import { nearZero, randomInUnitSphere, randomUnitVector, reflect, refract } from './Util.js';

export class Material {
    scatter(rIn, rec, attenuation, scattered) {
        return false;
    }
}

export class Lambertian extends Material {
    albedo;

    constructor(albedo) {
        super();

        this.albedo = albedo;
    }

    scatter(rIn, rec, attenuation, scattered) {
        let scatterDirection = vec3.add(vec3.create(), rec.normal, randomUnitVector());

        if (nearZero(scatterDirection)) {
            scatterDirection = rec.normal;
        }

        scattered.origin = rec.p;
        scattered.direction = scatterDirection;
        vec3.copy(attenuation, this.albedo);
        return true;
    }
}

export class Metal extends Material {
    albedo;
    fuzz;

    constructor(albedo, fuzz) {
        super();

        this.albedo = albedo;
        this.fuzz = fuzz;
    }

    scatter(rIn, rec, attenuation, scattered) {
        let reflected = reflect(vec3.normalize(vec3.create(), rIn.direction), rec.normal);

        scattered.origin = rec.p;
        scattered.direction = vec3.add(vec3.create(), reflected, vec3.scale(vec3.create(), randomInUnitSphere(), this.fuzz));
        vec3.copy(attenuation, this.albedo);
        return true;
    }
}

export class Dielectric extends Material {
    refIdx;

    constructor(refIdx) {
        super();

        this.refIdx = refIdx;
    }

    scatter(rIn, rec, attenuation, scattered) {
        vec3.copy(attenuation, vec3.fromValues(1.0, 1.0, 1.0));
        let refractionRatio = rec.frontFace ? (1.0 / this.refIdx) : this.refIdx;

        let unitDirection = vec3.normalize(vec3.create(), rIn.direction);

        let cosTheta = Math.min(vec3.dot(vec3.negate(vec3.create(), unitDirection), rec.normal), 1.0);
        let sinTheta = Math.sqrt(1.0 - (cosTheta * cosTheta));

        let cannotRefract = refractionRatio * sinTheta > 1.0;
        let direction = vec3.create();

        if (cannotRefract || this.reflectance(cosTheta, refractionRatio) > Math.random()) {
            vec3.copy(direction, reflect(unitDirection, rec.normal));
        } else {
            vec3.copy(direction, refract(unitDirection, rec.normal, refractionRatio));
        }

        scattered.origin = rec.p;
        scattered.direction = direction;
        return true;
    }

    reflectance(cosine, refIdx) {
        let r0 = (1.0 - refIdx) / (1.0 + refIdx);
        r0 = r0 * r0;
        return r0 + ((1.0 - r0) * Math.pow((1.0 - cosine), 5.0));
    }
}
