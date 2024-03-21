import world from "../index.ts";

import Mesh from "../components/Mesh.ts";
import Material from "../components/Material.ts";
import Transform from "../components/Transform.ts";
import {vec2} from "gl-matrix";

import {EntityId} from "@jakeklassen/ecs";
import {MapTag, PlayerTag} from "../components/Tags.ts";

import gltf from "@assets/models/human_male.gltf?url"

function base64ToArrayBuffer(base64) {
    // Remove base64 prefix (e.g., "data:application/octet-stream;base64,") and decode
    var binary_string = window.atob(base64.split(',')[1]);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 *
 * @param position X,Z coordinate of where to spawn the player
 */
function createPlayer(position: vec2 = [0, 0]): EntityId {
    const e = world.createEntity();

    let mesh: Mesh = new Mesh(),
        material: Material = new Material(),
        transform: Transform = new Transform();

    fetch(gltf).then(response => response.json()).then(data => {
        console.log(data)

        data.buffers.forEach(b => {
            let buffer = base64ToArrayBuffer(b.uri);

            let positionBufferView = data.bufferViews[ data.accessors[0].bufferView ];
            let normalBufferView = data.bufferViews[ data.accessors[1].bufferView ];

            let positions = new Float32Array(buffer.slice(positionBufferView.byteOffset, positionBufferView.byteLength));
            let normals = new Float32Array(buffer.slice(normalBufferView.byteOffset));

            console.log(positions, normals);
        })
    });

    const map_id = world.findEntity(MapTag);
    if(!map_id) console.error("Can't Create Player Until Map Has Been Created!");

    const map = <MapTag> world.getEntityComponents(map_id as number)?.get(MapTag);

    transform.position = [
        position[0],
        map.height(position[0], position[1]),
        position[1]
    ];

    world.addEntityComponents(e, mesh, material, transform, new PlayerTag());

    return e;
}

export default createPlayer;