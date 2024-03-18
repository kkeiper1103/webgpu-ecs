import world from "../index.ts";

import Mesh from "../components/Mesh.ts";
import Material from "../components/Material.ts";
import Transform from "../components/Transform.ts";
import {vec3} from "gl-matrix";

import {EntityId} from "@jakeklassen/ecs";


function createPlayer(position: vec3 = [0, 0, 0]): EntityId {
    const e = world.createEntity();

    let mesh: Mesh = new Mesh(),
        material: Material = new Material(),
        transform: Transform = new Transform();

    transform.position = position;

    world.addEntityComponents(e, mesh, material, transform);

    return e;
}