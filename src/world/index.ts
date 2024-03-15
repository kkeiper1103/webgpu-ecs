import {World} from "ape-ecs";

import RenderSystem from "./systems/RenderSystem.ts";
import UpdateSystem from "./systems/UpdateSystem.ts";

import Mesh from "./components/Mesh.ts";
import Transform from "./components/Transform.ts";
import MetaValues from "./components/MetaValues.ts";
import Material from "./components/Material.ts";


const world = new World();


world.registerComponent(Mesh, 100);
world.registerComponent(Transform, 100);
world.registerComponent(MetaValues, 100);
world.registerComponent(Material, 100);

world.registerSystem("update", UpdateSystem);
world.registerSystem("render", RenderSystem);

export default world;