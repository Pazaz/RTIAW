import { Vec3, Point3 } from './Vec3.js';

export class HitRecord {
    p = new Point3(0, 0, 0);
    normal = new Vec3(0, 0, 0);
    material;
    t = 0;
    frontFace = true;

    setFaceNormal(r, outward_normal) {
        this.frontFace = r.dir.dot(outward_normal) < 0;
        this.normal = this.frontFace ? outward_normal : outward_normal.mulScalar(-1);
    }
}

export class Hittable {
    hit(r, tMin, tMax, rec) { }
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
                rec = tempRec;
            }
        }

        return { hitAnything, rec };
    }
}

export class Sphere extends Hittable {
    center = new Point3(0, 0, 0);
    radius;
    material;

    constructor(center, radius = 0.0, material) {
        super();

        if (center instanceof Point3) {
            this.center = center;
        }

        if (radius) {
            this.radius = radius;
        }

        if (material) {
            this.material = material;
        }
    }

    hit(r, tMin, tMax, rec) {
        let oc = r.orig.sub(this.center);
        let a = r.dir.lengthSquared();
        let halfB = oc.dot(r.dir);
        let c = oc.lengthSquared() - this.radius * this.radius;

        let discriminant = halfB * halfB - a * c;
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
        let outwardNormal = rec.p.sub(this.center).divScalar(this.radius);
        rec.setFaceNormal(r, outwardNormal);
        rec.material = this.material;

        return true;
    }
}
