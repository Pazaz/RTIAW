import { vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm';

export function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

export function downloadToFile(content, filename, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
};

export function saveText(filename, content) {
    downloadToFile(content, filename, 'text/plain');
}

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function randomInUnitSphere() {
    while (true) {
        let randX = Math.random() * 2 - 1;
        let randY = Math.random() * 2 - 1;
        let randZ = Math.random() * 2 - 1;
        let p = vec3.fromValues(randX, randY, randZ);
        if (vec3.squaredLength(p) >= 1) {
            continue;
        }
        return p;
    }
}

export function randomUnitVector() {
    return vec3.normalize(vec3.create(), randomInUnitSphere());
}

export function randomInHemiSphere(normal) {
    let inUnitSphere = randomInUnitSphere();
    if (vec3.dot(inUnitSphere, normal) > 0.0) {
        return inUnitSphere;
    }
    return vec3.negate(vec3.create(), inUnitSphere);
}

export function nearZero(v) {
    const s = 1e-8;
    return (Math.abs(v.x) < s) && (Math.abs(v.y) < s) && (Math.abs(v.z) < s);
}

export function reflect(v, n) {
    return vec3.subtract(vec3.create(), v, vec3.scale(vec3.create(), n, 2 * vec3.dot(v, n)));
}

export function refract(uv, n, etaiOverEtat) {
    let cosTheta = Math.min(vec3.dot(vec3.negate(vec3.create(), uv), n), 1.0);
    let rOutPerp = vec3.scale(vec3.create(), vec3.add(vec3.create(), uv, vec3.scale(vec3.create(), n, cosTheta)), etaiOverEtat);
    let rOutParallel = vec3.scale(vec3.create(), n, -Math.sqrt(Math.abs(1.0 - vec3.squaredLength(rOutPerp))));
    return vec3.add(vec3.create(), rOutPerp, rOutParallel);
}

export function randomInUnitDisk() {
    while (true) {
        let p = vec3.fromValues(Math.random() * 2 - 1, Math.random() * 2 - 1, 0);
        if (vec3.squaredLength(p) >= 1) {
            continue;
        }
        return p;
    }
}

export function random(min, max) {
    return Math.random() * (max - min) + min;
}
