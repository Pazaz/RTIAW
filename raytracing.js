let canvas = document.getElementById('canvas');

let width = canvas.width;
let height = canvas.height;
let aspectRatio = width / height;

let ctx = canvas.getContext('2d');
let imageData = ctx.createImageData(width, height);

function clearCanvas(color) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            setPixel(x, y, color);
        }
    }
}

function setPixel(x, y, color) {
    let index = (x + y * width) * 4;
    imageData.data[index + 0] = color.r() * 255;
    imageData.data[index + 1] = color.g() * 255;
    imageData.data[index + 2] = color.b() * 255;
    imageData.data[index + 3] = 255;
}

function refresh() {
    ctx.putImageData(imageData, 0, 0);
}

// ----

const pi = Math.PI;

function degreesToRadians(degrees) {
    return degrees * pi / 180;
}

// ----

class Vec3 {
    e = [0, 0, 0];

    constructor(e0 = 0, e1 = 0, e2 = 0) {
        this.e = [e0, e1, e2];
    }

    x() { return this.e[0]; }
    y() { return this.e[1]; }
    z() { return this.e[2]; }

    r() { return this.e[0]; }
    g() { return this.e[1]; }
    b() { return this.e[2]; }

    add(v) {
        return new Vec3(this.x() + v.x(), this.y() + v.y(), this.z() + v.z());
    }

    sub(v) {
        return new Vec3(this.x() - v.x(), this.y() - v.y(), this.z() - v.z());
    }

    mul(v) {
        return new Vec3(this.x() * v.x(), this.y() * v.y(), this.z() * v.z());
    }

    div(v) {
        return new Vec3(this.x() / v.x(), this.y() / v.y(), this.z() / v.z());
    }

    mulScalar(s) {
        return new Vec3(this.x() * s, this.y() * s, this.z() * s);
    }

    divScalar(s) {
        return new Vec3(this.x() / s, this.y() / s, this.z() / s);
    }

    dot(v) {
        return this.x() * v.x() + this.y() * v.y() + this.z() * v.z();
    }

    cross(v) {
        return new Vec3(this.y() * v.z() - this.z() * v.y(),
            this.z() * v.x() - this.x() * v.z(),
            this.x() * v.y() - this.y() * v.x());
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() {
        return this.dot(this);
    }

    unitVector() {
        return this.divScalar(this.length());
    }

    static random() {
        return new Vec3(Math.random(), Math.random(), Math.random());
    }

    static randomRange(min, max) {
        return new Vec3(Math.random() * (max - min) + min, Math.random() * (max - min) + min, Math.random() * (max - min) + min);
    }

    static randomInUnitSphere() {
        while (true) {
            let p = Vec3.randomRange(-1, 1);
            if (p.length() >= 1) continue;
            return p;
        }
    }

    static randomUnitVector() {
        return Vec3.randomInUnitSphere().unitVector();
    }

    static reflect(v, n) {
        return v.sub(n.mulScalar(2 * v.dot(n)));
    }

    static refract(v, n, niOverNt) {
        let uv = v.unitVector();
        let dt = uv.dot(n);
        let discriminant = 1.0 - niOverNt * niOverNt * (1 - dt * dt);
        if (discriminant > 0) {
            return uv.sub(n.mulScalar(dt)).mulScalar(niOverNt).sub(n.mulScalar(Math.sqrt(discriminant)));
        } else {
            return null;
        }
    }

    nearZero() {
        let s = 1e-8;
        return (Math.abs(this.x()) < s) && (Math.abs(this.y()) < s) && (Math.abs(this.z()) < s);
    }

    static nearZero(v) {
        let s = 1e-8;
        return (Math.abs(v.x()) < s) && (Math.abs(v.y()) < s) && (Math.abs(v.z()) < s);
    }

    static randomInUnitDisk() {
        while (true) {
            let p = new Vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, 0);
            if (p.length() >= 1) continue;
            return p;
        }
    }

    static randomInHemisphere(normal) {
        let inUnitSphere = Vec3.randomInUnitSphere();
        if (inUnitSphere.dot(normal) > 0.0) {
            return inUnitSphere;
        } else {
            return inUnitSphere.mulScalar(-1);
        }
    }

    static randomInUnitCircle() {
        while (true) {
            let p = new Vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, 0);
            if (p.length() >= 1) continue;
            return p;
        }
    }

    static randomCosineDirection() {
        let r1 = Math.random();
        let r2 = Math.random();
        let z = Math.sqrt(1 - r2);

        let phi = 2 * Math.PI * r1;
        let x = Math.cos(phi) * Math.sqrt(r2);
        let y = Math.sin(phi) * Math.sqrt(r2);

        return new Vec3(x, y, z);
    }

    static randomToSphere(radius, distanceSquared) {
        let r1 = Math.random();
        let r2 = Math.random();
        let z = 1 + r2 * (Math.sqrt(1 - radius * radius / distanceSquared) - 1);

        let phi = 2 * Math.PI * r1;
        let x = Math.cos(phi) * Math.sqrt(1 - z * z);
        let y = Math.sin(phi) * Math.sqrt(1 - z * z);

        return new Vec3(x, y, z);
    }
}

class Point3 extends Vec3 {
    constructor(x, y, z) {
        super(x, y, z);
    }

    static random() {
        return new Point3(Math.random(), Math.random(), Math.random());
    }

    static randomRange(min, max) {
        return new Point3(Math.random() * (max - min) + min, Math.random() * (max - min) + min, Math.random() * (max - min) + min);
    }
}

class Color extends Vec3 {
    constructor(r, g, b) {
        super(r, g, b);
    }

    static fromRGB(r, g, b) {
        return new Color(r / 255, g / 255, b / 255);
    }

    static fromHex(hex) {
        return Color.fromRGB(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16));
    }

    static fromString(str) {
        return Color.fromHex(str);
    }

    static random() {
        return new Color(Math.random(), Math.random(), Math.random());
    }

    static randomRange(min, max) {
        return new Color(Math.random() * (max - min) + min, Math.random() * (max - min) + min, Math.random() * (max - min) + min);
    }
}

class Ray {
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

class Material {
    scatter(r, rec, attenuation, scattered) { }
}

class Lambertian extends Material {
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

class Metal extends Material {
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

class Dielectric extends Material {
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

class HitRecord {
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

class Hittable {
    hit(r, tMin, tMax, rec) { }
}

class HittableList extends Hittable {
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

class Sphere extends Hittable {
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

class Camera {
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

// ----

function rayColor(r, world, depth) {
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

const samplesPerPixel = 1;
const maxDepth = 4;

function randomScene() {
    let world = new HittableList();

    let groundMaterial = new Lambertian(new Color(0.5, 0.5, 0.5));
    world.add(new Sphere(new Point3(0, -1000, 0), 1000, groundMaterial));

    for (let a = -11; a < 11; a++) {
        for (let b = -11; b < 11; b++) {
            let chooseMat = Math.random();
            let center = new Point3(a + 0.9 * Math.random(), 0.2, b + 0.9 * Math.random());

            if (center.sub(new Point3(4, 0.2, 0)).length() > 0.9) {
                let sphereMaterial;

                if (chooseMat < 0.8) {
                    // diffuse
                    let albedo = new Color(Math.random() * Math.random(), Math.random() * Math.random(), Math.random() * Math.random());
                    sphereMaterial = new Lambertian(albedo);
                    world.add(new Sphere(center, 0.2, sphereMaterial));
                } else if (chooseMat < 0.95) {
                    // metal
                    let albedo = new Color(0.5 * (1 + Math.random()), 0.5 * (1 + Math.random()), 0.5 * (1 + Math.random()));
                    let fuzz = 0.5 * Math.random();
                    sphereMaterial = new Metal(albedo, fuzz);
                    world.add(new Sphere(center, 0.2, sphereMaterial));
                } else {
                    // glass
                    sphereMaterial = new Dielectric(1.5);
                    world.add(new Sphere(center, 0.2, sphereMaterial));
                }
            }
        }
    }

    let material1 = new Dielectric(1.5);
    world.add(new Sphere(new Point3(0, 1, 0), 1.0, material1));

    let material2 = new Lambertian(new Color(0.4, 0.2, 0.1));
    world.add(new Sphere(new Point3(-4, 1, 0), 1.0, material2));

    let material3 = new Metal(new Color(0.7, 0.6, 0.5), 0.0);
    world.add(new Sphere(new Point3(4, 1, 0), 1.0, material3));

    return world;
}

// World

// let world = new HittableList();

// let materialGround = new Lambertian(new Color(0.8, 0.8, 0.0));
// let materialCenter = new Lambertian(new Color(0.1, 0.2, 0.5));
// let materialLeft = new Dielectric(1.5);
// let materialRight = new Metal(new Color(0.8, 0.6, 0.2), 0.0);

// world.add(new Sphere(new Point3(0.0, -100.5, -1.0), 100.0, materialGround));
// world.add(new Sphere(new Point3(0.0, 0.0, -1.0), 0.5, materialCenter));
// world.add(new Sphere(new Point3(-1.0, 0.0, -1.0), 0.5, materialLeft));
// world.add(new Sphere(new Point3(-1.0, 0.0, -1.0), -0.45, materialLeft));
// world.add(new Sphere(new Point3(1.0, 0.0, -1.0), 0.5, materialRight));

let world = randomScene();

// Camera
let lookFrom = new Point3(13, 2, 3);
let lookAt = new Point3(0, 0, 0);
let vup = new Vec3(0, 1, 0);
let distToFocus = 10.0;
let aperture = 0.1;
let camera = new Camera(lookFrom, lookAt, vup, 20, aspectRatio, aperture, distToFocus);

let average = [];

for (let j = 0; j < height; ++j) {
    for (let i = 0; i < width; ++i) {
        let pixelColor = new Color(0, 0, 0);

        let start = Date.now();
        for (let s = 0; s < samplesPerPixel; ++s) {
            let u = (i + Math.random()) / (width - 1);
            let v = (j + Math.random()) / (height - 1);
            let r = camera.getRay(u, v);
            pixelColor = pixelColor.add(rayColor(r, world, maxDepth));
        }
        let end = Date.now();
        average.push(end - start);

        let r = pixelColor.r();
        let g = pixelColor.g();
        let b = pixelColor.b();

        let scale = 1.0 / samplesPerPixel;
        r = Math.sqrt(scale * r);
        g = Math.sqrt(scale * g);
        b = Math.sqrt(scale * b);

        pixelColor = new Color(r, g, b);
        setPixel(i, height - j, pixelColor);
    }
}
refresh();

let sum = 0;
for (let i = 0; i < average.length; ++i) {
    sum += average[i];
}
console.log('Total time: ' + (sum / 1000).toFixed(2) + 's');
