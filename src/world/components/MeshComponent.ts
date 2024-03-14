import {Component} from "ape-ecs";
import device from "../../gpu/device.ts";


import shader_src from "../../../assets/shaders/shader.wgsl";

let shader = device.createShaderModule({
    label: "General Shader Module",
    code: shader_src
});

let pipeline = device.createRenderPipeline({
    label: "Basic Render Pipeline",
    layout: "auto",
    vertex: {
        module: shader,
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
        }]
    },
    fragment: {
        module: shader,
        entryPoint: "fragment",
        targets: [{
            format: navigator.gpu.getPreferredCanvasFormat()
        }]
    },
});

// @todo move to own file
export { pipeline };

export default class MeshComponent extends Component {
    buffers: GPUBuffer[] = [];
    pipeline: GPURenderPipeline = pipeline;
    numVertices: number = 0;

    init(initial: any) {
        super.init(initial);

        let data = new Float32Array(initial.positions);
        this.buffers[0] = device.createBuffer({
            label: "Position Buffer",
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffers[0], 0, data);
        this.numVertices = data.length / 3;

        data = new Float32Array(initial.colors);
        this.buffers[1] = device.createBuffer({
            label: "Color Buffer",
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffers[1], 0, data);

        //
        if(!!initial.pipeline)
            this.pipeline = pipeline;
    }


    destroy() {
        this.buffers.forEach(buffer => buffer.destroy());

        super.destroy();
    }
}

MeshComponent.properties = {
    buffers: Array<GPUBuffer>(),
    numVertices: 0,
    pipeline: pipeline
};