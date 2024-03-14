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
            ],
        },

        TransformComponent: {
            position: [0, 0, 0],
            rotation: [0, 0, 0]
        }
    }
});

let last = performance.now();
requestAnimationFrame(function render(now) {
    requestAnimationFrame(render);

    const dt = (now - last) / 1000;
    last = now;

    world.runSystems("update");
    world.runSystems("render");
});