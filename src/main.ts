import './style.css'

import world from "./world";

createTestEntity();

let last = performance.now();
requestAnimationFrame(function render(now) {
    requestAnimationFrame(render);

    const dt = (now - last) / 1000;
    last = now;

    world.runSystems("update");
    world.runSystems("render");
});


//
function createTestEntity() {
    let image = new Image();
    image.onload = () => {
        const e = world.createEntity({
            id: "triangle",
            c: {
                Mesh: {
                    positions: [
                        1, 1, 0,
                        1, -1, 0,
                        -1, 1, 0,

                        1, -1, 0,
                        -1, -1, 0,
                        -1, 1, 0
                    ],
                    colors: [
                        1, 1, 0,
                        1, 1, 0,
                        1, 1, 0,
                        1, 1, 0,
                        1, 1, 0,
                        1, 1, 0,
                    ],
                    uvs: [
                        1, 0,
                        1, 1,
                        0, 0,

                        1, 1,
                        0, 1,
                        0, 0
                    ]
                },

                Transform: {
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [4, 4, 4]
                },

                Material: {
                    image,

                    /*
                    these are overridden when image is passed as an ImageBitmap

                    pixels: [
                        255, 0, 255, 255, 255, 255, 255, 255,
                        255, 255, 255, 255, 255, 0, 255, 255
                    ],
                    size: [2, 2],

                    */

                    samplerDescriptor: {
                        addressModeU: "clamp-to-edge",
                        addressModeV: "clamp-to-edge",
                        minFilter: "linear",
                        magFilter: "linear"
                    } as GPUSamplerDescriptor
                }
            }
        });
    }
    image.onerror = () => { console.log('error') }
    image.src = "/zomboid.png";
}