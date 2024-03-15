import {World} from "ape-ecs";

import RenderSystem from "./systems/RenderSystem.ts";
import UpdateSystem from "./systems/UpdateSystem.ts";

import Mesh from "./components/Mesh.ts";
import Transform from "./components/Transform.ts";
import MetaValues from "./components/MetaValues.ts";
import Material from "./components/Material.ts";


const world = new World();


world.registerComponent(Mesh);
world.registerComponent(Transform);
world.registerComponent(MetaValues);
world.registerComponent(Material);

world.registerSystem("update", UpdateSystem);
world.registerSystem("render", RenderSystem);

export default world;