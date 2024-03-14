import {World} from "ape-ecs";

import MeshComponent from "./components/MeshComponent.ts";
import RenderSystem from "./systems/RenderSystem.ts";
import UpdateSystem from "./systems/UpdateSystem.ts";
import TransformComponent from "./components/TransformComponent.ts";
import MetaValuesComponent from "./components/MetaValuesComponent.ts";


const world = new World();


world.registerComponent(MeshComponent);
world.registerComponent(TransformComponent);
world.registerComponent(MetaValuesComponent);

world.registerSystem("update", UpdateSystem);
world.registerSystem("render", RenderSystem);

export default world;