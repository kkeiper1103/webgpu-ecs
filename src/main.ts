import './style.css'

import world from "./world";
import {Entity} from "ape-ecs";
import Material from "./world/components/Material.ts";







const e3 = createTestEntity();
e3.c.Transform.position = [3, 3, -3];

const e4 = createTestEntity();
e4.c.Transform.position = [-2, 0, -2];

const e1 = createIndexedEntity();
e1.c.Transform.position = [-1, 0, -4];

const e2 = createIndexedEntity();
e2.c.Transform.position = [2, 0, -6];





let last = performance.now();
requestAnimationFrame(function render(now) {
    requestAnimationFrame(render);

    const dt = (now - last) / 1000;
    last = now;



    world.runSystems("update");
    world.runSystems("render");
    world.tick()
});

function createIndexedEntity() {
    return world.createEntity({
        c: {
            Mesh: {
                positions: [
                    -.5, .5, 0,
                    -.5, -.5, 0,
                    .5, .5, 0,
                    .5, -.5, 0,
                ],
                colors: [
                    1, 0, 0,
                    0, 1, 0,
                    0, 0, 1,
                    1, 1, 0,
                ],
                uvs: [
                    0, 0,
                    0, 1,
                    1, 0,
                    1, 1,
                ],
                indices: [
                    0, 1, 2,
                    2, 1, 3
                ]
            },
            Material: {
                pixels: [
                    255, 0, 255, 255,       255, 255, 255, 255,
                    255, 255, 255, 255,     255, 0, 255, 255
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
function createTestEntity() : Entity {
    let e = world.createEntity({
        c: {
            Mesh: {
                positions: [
                    -.5, .5, 0, //0
                    -.5, -.5, 0, //1
                    .5, .5, 0, //2

                    .5, .5, 0, //2
                    -.5, -.5, 0, //1
                    .5, -.5, 0, //3
                ],
                colors: [
                    1, 0, 0, //0
                    0, 1, 0, //1
                    0, 0, 1, //2

                    0, 0, 1, //2
                    0, 1, 0, //1
                    1, 1, 0, //3
                ],
                uvs: [
                    0, 0, //0
                    0, 1, //1
                    1, 0, //2

                    1, 0, //2
                    0, 1, //1
                    1, 1, //3
                ]
            },

            Transform: {
                position: [1, 0, 0],
                rotation: [0, 0, 0],
                scale: [2, 2, 2]
            },
        }
    });

    let image = new Image();
    image.onload = () => {
        e.addComponent({
            type: Material.name,
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
        })
    }
    image.onerror = () => { console.log('error') }
    image.src = "/zomboid.png";

    return e;
}