import { Vec3, Point3, Color } from './Vec3.js';
import { HittableList, Sphere } from './Hittable.js';
import { Lambertian, Metal, Dielectric } from './Material.js';
import { Camera } from './Camera.js';
import { rayColor } from './Ray.js';

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
