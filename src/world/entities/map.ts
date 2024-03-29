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
for(let z=0; z < MAP_SIZE; z += 1) {
    for(let x = 0; x < MAP_SIZE; x += 1) {
        let idx = z * MAP_SIZE + x;

        let elevation = BASE_ELEVATION +
            (     1 * mapgen(x / 10, z / 10)
              +  .5 * mapgen(2 * x / 10, 2 * z / 10)
              + .25 * mapgen(4 * x / 10, 4 * z / 10) ) / (1 + .5 + .25);


        elevation = Math.pow(elevation, .87);

        heights[idx] = elevation - BASE_ELEVATION;
    }
}

import grass from "@assets/images/grass.png?url"
import {EntityId} from "@jakeklassen/ecs";
import {MapTag} from "../components/Tags.ts";
import {vec3} from "gl-matrix";

function normal(a: vec3, b: vec3, c: vec3): vec3 {
    let ba = vec3.create(),
        ca = vec3.create();

    vec3.sub(ba, b, a);
    vec3.sub(ca, c, a);

    let out = vec3.create();

    vec3.cross(out, ba, ca);
    vec3.normalize(out, out);

    return out;
}

function createMapTerrain(seed: number): EntityId {
    const e = world.createEntity();

    let positions: number[] = [], uvs: number[] = [], colors: number[] = [], indices: number[] = [], normals: number[] = [];

    let start = 0;
    // @todo introduce subdivision of mesh to allow for finer grain triangles.
    for(let z=0; z < MAP_SIZE; z++) {
        for(let x=0; x < MAP_SIZE; x++) {

            // Now use finalHeight for your vertex height at position (realX, realZ)
            indices.push(
                start, start + 1, start + 2,
                start, start + 2, start + 3,
            );
            start += 4;

            let a = [x,      heights[idx(x, z)],                z],
                b = [x + 1,  heights[idx(x + 1, z)],         z],
                c = [x + 1,  heights[idx(x + 1, z + 1)],  z + 1],
                d = [x,      heights[idx(x, z + 1)],         z + 1];
            positions.push(
                ...a,
                ...b,
                ...c,
                ...d,
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

            // must match order of indices above. 0, 1, 2 ... 0, 2, 3
            let normal_a = normal(a, b, c);
            let normal_b = normal(a, c, d);
            normals.push(
                ...normal_a,
                ...normal_a,
                ...normal_b,
                ...normal_b,
            );
        }
    }

    let mesh = new Mesh({
        positions, colors, uvs, indices, normals
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

    world.addEntityComponents(e, mesh, material, transform, new MapTag(heights, MAP_SIZE, MAP_SIZE));


    let image = new Image();
    image.src = grass
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

        world.removeEntityComponents(e, Material);
        world.addEntityComponents(e, actual);

        material.destroy();
    })

    return e;
}

export default createMapTerrain;