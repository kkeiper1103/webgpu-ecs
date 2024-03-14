import './style.css'

import device from "./gpu/device.ts";
import world from "./world";

import shader_code from '../assets/shaders/shader.wgsl'
const shader = device.createShaderModule({
    label: "Shader Module",
    code: shader_code
});


const e = world.createEntity({
    id: "triangle",
    c: {
        MeshComponent: {
            positions: [
                -1, 1, 0,
                1, -1, 0,
                1, 1, 0,

                -1, 1, 0,
                -1, -1, 0,
                1, -1, 0
            ],
            colors: [
                1, 1, 1,
                1, 0, 1,
                0, 0, 1,

                0, 1, 0,
                0, 1, 1,
                1, 1, 0
            ]
        }
    }
});


requestAnimationFrame(function render(now) {
    requestAnimationFrame(render);

    world.runSystems("update");
    world.runSystems("collision");

    world.runSystems("render");
});