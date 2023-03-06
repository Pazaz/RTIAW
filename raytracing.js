import { glMatrix, vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm';
glMatrix.setMatrixArrayType(Array);

import { HittableList, Sphere } from './Hittable.js';
import { Lambertian, Metal, Dielectric } from './Material.js';
import { Camera } from './Camera.js';
import { rayColor } from './Ray.js';
import { CanvasRender } from './Render.js';
import { clamp, sleep } from './Util.js';

/// ----

let render = new CanvasRender(document.getElementById('canvas'));
render.clear(vec3.create());

const samplesPerPixel = 4;
const maxDepth = 50;

// World

function randomScene() {
    let world = new HittableList();

    let groundMaterial = new Lambertian(vec3.fromValues(0.5, 0.5, 0.5));
    world.add(new Sphere(vec3.fromValues(0, -1000, 0), 1000, groundMaterial));

    for (let a = -11; a < 11; a++) {
        for (let b = -11; b < 11; b++) {
            let chooseMat = Math.random();
            let center = vec3.fromValues(a + 0.9 * Math.random(), 0.2, b + 0.9 * Math.random());

            if (vec3.distance(center, vec3.fromValues(4, 0.2, 0)) > 0.9) {
                let sphereMaterial;

                if (chooseMat < 0.8) {
                    // diffuse
                    let albedo = vec3.create();
                    vec3.mul(albedo, vec3.random(vec3.create()), vec3.random(vec3.create()));
                    sphereMaterial = new Lambertian(albedo);
                    world.add(new Sphere(center, 0.2, sphereMaterial));
                } else if (chooseMat < 0.95) {
                    // metal
                    let albedo = vec3.random(vec3.create());
                    let fuzz = Math.random() * 0.5;
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
    world.add(new Sphere(vec3.fromValues(0, 1, 0), 1.0, material1));

    let material2 = new Lambertian(vec3.fromValues(0.4, 0.2, 0.1));
    world.add(new Sphere(vec3.fromValues(-4, 1, 0), 1.0, material2));

    let material3 = new Metal(vec3.fromValues(0.7, 0.6, 0.5), 0.0);
    world.add(new Sphere(vec3.fromValues(4, 1, 0), 1.0, material3));

    return world;
}

// let world = new HittableList();

// let materialGround = new Lambertian(vec3.fromValues(0.8, 0.8, 0.0));
// let materialCenter = new Lambertian(vec3.fromValues(0.1, 0.2, 0.5));
// let materialLeft = new Dielectric(1.5);
// let materialRight = new Metal(vec3.fromValues(0.8, 0.6, 0.2), 0.0);

// world.add(new Sphere(vec3.fromValues(0, -100.5, -1), 100, materialGround));
// world.add(new Sphere(vec3.fromValues(0, 0, -1), 0.5, materialCenter));
// world.add(new Sphere(vec3.fromValues(-1, 0, -1), 0.5, materialLeft));
// world.add(new Sphere(vec3.fromValues(-1, 0, -1), -0.45, materialLeft));
// world.add(new Sphere(vec3.fromValues(1, 0, -1), 0.5, materialRight));

// let lookFrom = vec3.fromValues(3, 3, 2);
// let lookAt = vec3.fromValues(0, 0, -1);
// let vUp = vec3.fromValues(0, 1, 0);
// let distToFocus = vec3.length(vec3.sub(vec3.create(), lookFrom, lookAt));
// let aperture = 2.0;
// let camera = new Camera(lookFrom, lookAt, vUp, 20.0, render.aspectRatio, aperture, distToFocus);

let world = new randomScene();

// Camera

let lookFrom = vec3.fromValues(13, 2, 3);
let lookAt = vec3.fromValues(0, 0, 0);
let vUp = vec3.fromValues(0, 1, 0);
let distToFocus = 10.0;
let aperture = 0.1;
let camera = new Camera(lookFrom, lookAt, vUp, 20.0, render.aspectRatio, aperture, distToFocus);

// Render

let average = [];

for (let j = render.height - 1; j >= 0; --j) {
    for (let i = 0; i < render.width; ++i) {
        let pixelColor = vec3.fromValues(0, 0, 0);

        let start = Date.now();
        for (let s = 0; s < samplesPerPixel; ++s) {
            let u = (i + Math.random()) / (render.width - 1);
            let v = (j + Math.random()) / (render.height - 1);
            let ray = camera.getRay(u, v);
            vec3.add(pixelColor, pixelColor, rayColor(ray, world, maxDepth));
        }
        let end = Date.now();
        average.push(end - start);

        let r = pixelColor[0];
        let g = pixelColor[1];
        let b = pixelColor[2];

        let scale = 1.0 / samplesPerPixel;
        // r *= scale;
        // g *= scale;
        // b *= scale;
        r = Math.sqrt(scale * r);
        g = Math.sqrt(scale * g);
        b = Math.sqrt(scale * b);

        pixelColor = vec3.fromValues(Math.floor(256 * clamp(r, 0.0, 0.999)), Math.floor(256 * clamp(g, 0.0, 0.999)), Math.floor(256 * clamp(b, 0.0, 0.999)));
        render.setPixel(i, render.height - j, pixelColor);
    }

    if (j % 10 == 0) {
        render.draw();
        await sleep(0);
    }
}
render.draw();

let sum = 0;
for (let i = 0; i < average.length; ++i) {
    sum += average[i];
}
console.log('Total time: ' + (sum / 1000).toFixed(2) + 's');
