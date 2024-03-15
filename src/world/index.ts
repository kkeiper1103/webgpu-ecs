import { World } from "@jakeklassen/ecs"

import RenderSystem from "./systems/RenderSystem.ts";
import UpdateSystem from "./systems/UpdateSystem.ts";


const world = new World();

world.addSystem(new UpdateSystem());
world.addSystem(new RenderSystem());

export default world;