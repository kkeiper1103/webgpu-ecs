import './style.css'

import world from "./world";

import Material from "./world/components/Material.ts";
import Mesh from "./world/components/Mesh.ts";
import Transform from "./world/components/Transform.ts";
import createMapTerrain from "./world/entities/map.ts";
import createPlayer from "./world/entities/player.ts";


const map = createMapTerrain(1234);
const player = createPlayer([16.544, 2.8]);


const e3 = createTestEntity();
// @ts-ignore
world.getEntityComponents(e3).get<Transform>(Transform).position = [3, 3, -3];

const e4 = createTestEntity();
// @ts-ignore
world.getEntityComponents(e4).get<Transform>(Transform).position = [-2, 0, -2];


const e1 = createIndexedEntity();

// @ts-ignore
world.getEntityComponents(e1).get<Transform>(Transform).position = [-1, 0, -4];

const e2 = createIndexedEntity();

// @ts-ignore
world.getEntityComponents(e2).get<Transform>(Transform).position = [2, 0, -6];



let last = performance.now();
requestAnimationFrame(function render(now) {
    requestAnimationFrame(render);

    const dt = (now - last) / 1000;

    world.updateSystems(dt);

    last = now;
});

function createIndexedEntity(): number {
    const e = world.createEntity();

    let mesh = new Mesh({
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

        normals: [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ],
        indices: [
            0, 1, 2,
            2, 1, 3
        ]
    });
    let material = new Material({
        pixels: [
            255, 0, 255, 255,       255, 255, 255, 255,
            255, 255, 255, 255,     255, 0, 255, 255
        ],
        size: [2, 2],
        textureDescriptor: {
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
            size: [2, 2]
        },
        samplerDescriptor: {
            addressModeU: "clamp-to-edge",
            addressModeV: "clamp-to-edge",
            minFilter: "nearest",
            magFilter: "nearest"
        }
    });
    let transform = new Transform([-1, -1, -3],
        [0, 0, 0],
        [2, 2.5, 2]);

    world.addEntityComponents(
        e,
        mesh, material, transform
    );

    return e;
}



//
function createTestEntity() : number {
    const e = world.createEntity();

    let mesh = new Mesh({
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
            ],
            normals: [
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,

                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
            ]
        }),
        transform = new Transform();

    world.addEntityComponents(
        e,
        mesh, transform
    );

    let image = new Image();
    image.onload = () => {
        world.addEntityComponents(e, new Material({
            type: Material.name,
            image,

            textureDescriptor: {
                size: [image.width, image.height],
                format: "rgba8unorm",
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
            },

            samplerDescriptor: {
                addressModeU: "clamp-to-edge",
                addressModeV: "clamp-to-edge",
                minFilter: "linear",
                magFilter: "linear"
            } as GPUSamplerDescriptor
        }));
    }
    image.onerror = () => { console.log('error') }
    image.src = "/zomboid.png";

    return e;
}
