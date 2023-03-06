import { glMatrix, vec3 } from './gl-matrix.js';
glMatrix.setMatrixArrayType(Array);

import { HittableList, MovingSphere, Sphere } from './Hittable.js';
import { Lambertian, Metal, Dielectric } from './Material.js';
import { Camera } from './Camera.js';
import { rayColor } from './Ray.js';
import { CanvasRender } from './Render.js';
import { clamp, sleep } from './Util.js';
import { CheckerTexture, SolidColor } from './Texture.js';

/// ----

let render = new CanvasRender(document.getElementById('canvas'));
render.clear(vec3.create());

const samplesPerPixel = 4;
const maxDepth = 50;

// World

function randomScene() {
    let world = new HittableList();

    let checker = new CheckerTexture(new SolidColor(vec3.fromValues(0.2, 0.3, 0.1)), new SolidColor(vec3.fromValues(0.9, 0.9, 0.9)));
    world.add(new Sphere(vec3.fromValues(0, -1000, 0), 1000, new Lambertian(checker)));

    for (let a = -11; a < 11; a++) {
        for (let b = -11; b < 11; b++) {
            let chooseMat = Math.random();
            let center = vec3.fromValues(a + 0.9 * Math.random(), 0.2, b + 0.9 * Math.random());

            if (vec3.distance(center, vec3.fromValues(4, 0.2, 0)) > 0.9) {
                let sphereMaterial;

                let size = Math.random() * 0.2 + 0.1;
                if (chooseMat < 0.8) {
                    // diffuse
                    let albedo = new SolidColor(vec3.fromValues(Math.random() * Math.random(), Math.random() * Math.random(), Math.random() * Math.random()));
                    sphereMaterial = new Lambertian(albedo);

                    let chooseSphere = Math.random();
                    if (chooseSphere < 0.5) {
                        let center2 = vec3.add(vec3.create(), center, vec3.fromValues(0, Math.random() * 0.5, 0));
                        world.add(new MovingSphere(center, center2, 0.0, 1.0, size, sphereMaterial));
                    } else {
                        world.add(new Sphere(center, size, sphereMaterial));
                    }
                } else if (chooseMat < 0.95) {
                    // metal
                    let albedo = new SolidColor(vec3.fromValues(Math.random() * Math.random(), Math.random() * Math.random(), Math.random() * Math.random()));
                    let fuzz = Math.random() * 0.5;
                    sphereMaterial = new Metal(albedo, fuzz);
                    world.add(new Sphere(center, size, sphereMaterial));
                } else {
                    // glass
                    sphereMaterial = new Dielectric(1.5);
                    world.add(new Sphere(center, size, sphereMaterial));
                }
            }
        }
    }

    let material1 = new Dielectric(1.5);
    world.add(new Sphere(vec3.fromValues(0, 1, 0), 1.0, material1));

    let material2 = new Lambertian(new SolidColor(vec3.fromValues(0.4, 0.2, 0.1)));
    world.add(new Sphere(vec3.fromValues(-4, 1, 0), 1.0, material2));

    let material3 = new Metal(vec3.fromValues(0.7, 0.6, 0.5), 0.0);
    world.add(new Sphere(vec3.fromValues(4, 1, 0), 1.0, material3));

    return world;
}

function twoSpheres() {
    let world = new HittableList();

    let checker = new CheckerTexture(new SolidColor(vec3.fromValues(0.2, 0.3, 0.1)), new SolidColor(vec3.fromValues(0.9, 0.9, 0.9)));

    world.add(new Sphere(vec3.fromValues(0, -10, 0), 10, new Lambertian(checker)));
    world.add(new Sphere(vec3.fromValues(0, 10, 0), 10, new Lambertian(checker)));

    return world;
}

let world = null;
let lookFrom = vec3.create();
let lookAt = vec3.create();
let vFov = 40.0;
let aperture = 0.0;

// Camera

switch (0) {
    case 1:
        world = randomScene();
        lookFrom = vec3.fromValues(13, 2, 3);
        lookAt = vec3.fromValues(0, 0, 0);
        vFov = 20.0;
        aperture = 0.1;
        break;
    default:
    case 2:
        world = twoSpheres();
        lookFrom = vec3.fromValues(13, 2, 3);
        lookAt = vec3.fromValues(0, 0, 0);
        vFov = 20.0;
        break;
}

let vUp = vec3.fromValues(0, 1, 0);
let distToFocus = 10.0;
let camera = new Camera(lookFrom, lookAt, vUp, vFov, render.aspectRatio, aperture, distToFocus, 0.0, 1.0);

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
