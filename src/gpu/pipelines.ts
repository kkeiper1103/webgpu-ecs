import device from "./device.ts";
import shader_src from "../../assets/shaders/shader.wgsl";


let positionColorUvShader = device.createShaderModule({
    label: "Position-Color-UV Shader Module",
    code: shader_src
});

const positionBufferFormat: GPUVertexBufferLayout = {
    arrayStride: 12,
    attributes: [{
        format: "float32x3",
        offset: 0,
        shaderLocation: 0
    }]
};
const colorBufferFormat: GPUVertexBufferLayout = {
    arrayStride: 12,
    attributes: [{
        format: "float32x3",
        offset: 0,
        shaderLocation: 1
    }]
};
const uvBufferFormat: GPUVertexBufferLayout = {
    arrayStride: 8,
    attributes: [{
        format: "float32x2",
        offset: 0,
        shaderLocation: 2
    }]
};
const normalBufferFormat: GPUVertexBufferLayout = {
    arrayStride: 12,
    attributes: [{
        format: "float32x3",
        offset: 0,
        shaderLocation: 3
    }]
};

const positionColorUvPipeline = device.createRenderPipeline({
    label: "Basic Render Pipeline for Position/Color/UV",
    layout: "auto",
    vertex: {
        module: positionColorUvShader,
        entryPoint: "vertex",
        buffers: [positionBufferFormat, colorBufferFormat, uvBufferFormat, normalBufferFormat]
    },
    fragment: {
        module: positionColorUvShader,
        entryPoint: "fragment",
        targets: [{
            format: navigator.gpu.getPreferredCanvasFormat()
        }]
    },
    multisample: {
        count: 4,
    },
    depthStencil: {
        depthWriteEnabled: true,
        format: 'depth32float',
        depthCompare: 'less'
    },
    primitive: {
        // stripIndexFormat: "uint16",
        topology: 'triangle-list',
        frontFace: "ccw",
        cullMode: 'none'
    }
});

export {
    positionColorUvPipeline
}