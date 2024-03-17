import world from "../index.ts";
import Mesh from "../components/Mesh.ts";
import Material from "../components/Material.ts";
import Transform from "../components/Transform.ts";

import heights from "@assets/data/map.js"

let idx = (x: number, z: number): number => z * 8 + x;

function createMapTerrain(seed: number) {
    const e = world.createEntity();

    let positions: number[] = [], uvs: number[] = [], colors: number[] = [], indices: number[] = [];

    for(let z=0; z < 8; z++) {
        for(let x=0; x < 8; x++) {
            let idx = z * 8 + x;

            indices.push(
                0, 1, 2,
                2, 1, 3,
            );

            positions.push(
                x,
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

    world.addEntityComponents(e, mesh, material, new Transform());

    return e;
}

export default createMapTerrain;