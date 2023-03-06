export class Vec3 {
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

export class Point3 extends Vec3 {
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

export class Color extends Vec3 {
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
