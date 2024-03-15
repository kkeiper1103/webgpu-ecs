import device from "./device.ts";
import shader_src from "../../assets/shaders/shader.wgsl";


let positionColorUvShader = device.createShaderModule({
    label: "Position-Color-UV Shader Module",
    code: shader_src
});

const positionColorUvPipeline = device.createRenderPipeline({
    label: "Basic Render Pipeline",
    layout: "auto",
    vertex: {
        module: positionColorUvShader,
        entryPoint: "vertex",
        buffers: [{
            arrayStride: 12,
            attributes: [{
                format: "float32x3",
                offset: 0,
                shaderLocation: 0
            }]
        }, {
            arrayStride: 12,
            attributes: [{
                format: "float32x3",
                offset: 0,
                shaderLocation: 1
            }]
        }, {
            arrayStride: 8,
            attributes: [{
                format: "float32x2",
                offset: 0,
                shaderLocation: 2
            }]
        }]
    },
    fragment: {
        module: positionColorUvShader,
        entryPoint: "fragment",
        targets: [{
            format: navigator.gpu.getPreferredCanvasFormat()
        }]
    },
});

export {
    positionColorUvPipeline
}