import './style.css'

import world from "./world";

// createTestEntity();
createIndexedEntity();

let last = performance.now();
requestAnimationFrame(function render(now) {
    requestAnimationFrame(render);

    const dt = (now - last) / 1000;
    last = now;

    world.runSystems("update");
    world.runSystems("render");
});

function createIndexedEntity() {
    const e = world.createEntity({
        id: 'indexed-entity',
        c: {
            IndexedMesh: {
                positions: [
                    .5, .5, 0,
                    .5, -.5, 0,
                    -.5, -.5, 0,
                    -.5, .5, 0
                ],
                colors: [
                    1, 0, 0,
                    0, 1, 0,
                    0, 0, 1,
                    1, 1, 0,
                ],
                uvs: [
                    1, 1,
                    1, 0,
                    0, 0,
                    0, 1,
                ],
                indices: [
                    0, 1, 3,
                    1, 2, 3
                ]
            },
            Material: {
                pixels: [
                    255, 0, 255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 0, 255, 255
                ],
                size: [2, 2],
                samplerDescriptor: {
                    addressModeU: "clamp-to-edge",
                    addressModeV: "clamp-to-edge",
                    minFilter: "nearest",
                    magFilter: "nearest"
                }
            },
            Transform: {
                position: [-1, -1, -3],
                rotation: [0, 0, 0],
                scale: [2, 2.5, 2]
            }
        }
    });
}

//
function createTestEntity() {
    let image = new Image();
    image.onload = () => {
        const e = world.createEntity({
            id: "zomboid-screen",
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
                    position: [1, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [2, 2, 2]
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