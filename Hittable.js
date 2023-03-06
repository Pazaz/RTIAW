import { vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm';

export class HitRecord {
    p = vec3.create();
    normal = vec3.create();
    material = null;
    t = 0.0;
    frontFace = false;

    setFaceNormal(r, outwardNormal) {
        this.frontFace = vec3.dot(r.direction, outwardNormal) < 0;
        vec3.copy(this.normal, this.frontFace ? outwardNormal : vec3.negate(vec3.create(), outwardNormal));
    }

    copy(other) {
        vec3.copy(this.p, other.p);
        vec3.copy(this.normal, other.normal);
        this.t = other.t;
        this.frontFace = other.frontFace;
        this.material = other.material;
    }
}

export class Hittable {
    hit(r, tMin, tMax, rec) {
        return false;
    }
}

export class HittableList extends Hittable {
    objects = [];

    constructor(objects) {
        super();

        if (objects instanceof Array) {
            this.objects = objects;
        }
    }

    add(object) {
        this.objects.push(object);
    }

    clear() {
        this.objects = [];
    }

    hit(r, tMin, tMax, rec) {
        let tempRec = new HitRecord();
        let hitAnything = false;
        let closestSoFar = tMax;

        for (let object of this.objects) {
            if (object.hit(r, tMin, closestSoFar, tempRec)) {
                hitAnything = true;
                closestSoFar = tempRec.t;
                rec.copy(tempRec);
            }
        }

        return hitAnything;
    }
}

export class Sphere extends Hittable {
    center = vec3.create();
    radius = 0.0;
    material = null;

    constructor(center, radius, material) {
        super();

        this.center = center;
        this.radius = radius;
        this.material = material;
    }

    hit(r, tMin, tMax, rec) {
        let oc = vec3.sub(vec3.create(), r.origin, this.center);
        let a = vec3.squaredLength(r.direction);
        let halfB = vec3.dot(oc, r.direction);
        let c = vec3.squaredLength(oc) - (this.radius * this.radius);

        let discriminant = (halfB * halfB) - a * c;
        if (discriminant < 0) {
            return false;
        }

        let sqrtd = Math.sqrt(discriminant);

        let root = (-halfB - sqrtd) / a;
        if (root < tMin || tMax < root) {
            root = (-halfB + sqrtd) / a;
            if (root < tMin || tMax < root) {
                return false;
            }
        }

        rec.t = root;
        rec.p = r.at(rec.t);
        let outwardNormal = vec3.create();
        vec3.sub(outwardNormal, rec.p, this.center);
        vec3.scale(outwardNormal, outwardNormal, 1.0 / this.radius);
        rec.setFaceNormal(r, outwardNormal);
        rec.material = this.material;

        return true;
    }
}
