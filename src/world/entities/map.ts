import world from "../index.ts";
import Mesh from "../components/Mesh.ts";
import Material from "../components/Material.ts";
import Transform from "../components/Transform.ts";

// import heights from "@assets/data/map.js"
import mapgen from "@assets/data/simplex-map.js"

// @todo move to some sort of config file that isn't committed so this doesn't cause merge conflicts
const MAP_SIZE = 128;
let idx = (x: number, z: number): number => z * MAP_SIZE + x;
const BASE_ELEVATION = 2;

const heights: number[] = [];
const STEP_SIZE = .25;

for(let z=0; z < MAP_SIZE; z += STEP_SIZE) {
    for(let x = 0; x < MAP_SIZE; x += STEP_SIZE) {
        let idx = z * MAP_SIZE + x;

        let elevation = BASE_ELEVATION +
            (     1 * mapgen(x / 10, z / 10)
                        +  .5 * mapgen(2 * x / 10, 2 * z / 10)
                        + .25 * mapgen(4 * x / 10, 4 * z / 10) ) / (1 + .5 + .25);


        // elevation = Math.pow(elevation, .6868);


        heights[idx] = elevation - BASE_ELEVATION;
    }
}

import grass from "@assets/images/green-grass-background.jpg?url"

function createMapTerrain(seed: number) {
    const e = world.createEntity();

    let positions: number[] = [], uvs: number[] = [], colors: number[] = [], indices: number[] = [];


    let start = 0;
    for(let z=0; z < MAP_SIZE - 1; z++) {
        for(let x=0; x < MAP_SIZE - 1; x++) {

            indices.push(
                start, start + 1, start + 2,
                start, start + 2, start + 3,
            );
            start += 4;

            positions.push(
                x, heights[idx(x, z)], z,
                x + 1, heights[idx(x + 1, z)], z,
                x + 1, heights[idx(x + 1, z + 1)], z + 1,
                x, heights[idx(x, z + 1)], z + 1,
            );

            uvs.push(
                0, 0,
                1, 0,
                1, 1,
                0, 1,
            );

            colors.push(
                127, 127, 127,
                127, 127, 127,
                127, 127, 127,
                127, 127, 127,
            );
        }
    }

    let mesh = new Mesh({
        positions, colors, uvs, indices
    });

    let darkgreen = [1, 50, 32, 255],
        litegreen = [144, 238, 144, 255];

    let material = new Material({
        pixels: [
            darkgreen, litegreen, darkgreen, litegreen,
            litegreen, darkgreen, litegreen, darkgreen,
            darkgreen, litegreen, darkgreen, litegreen,
            litegreen, darkgreen, litegreen, darkgreen,
        ].flat(),
        size: [4, 4],
        textureDescriptor: {
            size: [4, 4],
            format: "rgba8unorm",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        },
        samplerDescriptor: {
            magFilter: "nearest",
            minFilter: "nearest",
            addressModeV: "repeat",
            addressModeU: "repeat"
        }
    });

    let transform = new Transform();
    transform.position[0] = - MAP_SIZE / 2;
    transform.position[2] = - MAP_SIZE / 2;

    world.addEntityComponents(e, mesh, material, transform);


    let image = new Image();
    image.src = grass
    console.log(image);
    image.decode().then(() => {
        const actual = new Material({
            image,
            textureDescriptor: {
                size: [4, 4],
                format: "rgba8unorm",
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
            },
            samplerDescriptor: {
                magFilter: "nearest",
                minFilter: "nearest",
                addressModeV: "repeat",
                addressModeU: "repeat"
            }
        });

        console.log('setting new material')

        world.removeEntityComponents(e, Material);
        world.addEntityComponents(e, actual);

        material.destroy();
    })

    return e;
}

export default createMapTerrain;