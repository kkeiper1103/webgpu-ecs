import {World} from "ape-ecs";

import MeshComponent from "./components/MeshComponent.ts";
import RenderSystem from "./systems/RenderSystem.ts";
import UpdateSystem from "./systems/UpdateSystem.ts";


const world = new World();


world.registerComponent(MeshComponent);

world.registerSystem("update", UpdateSystem);
world.registerSystem("render", RenderSystem);

export default world;