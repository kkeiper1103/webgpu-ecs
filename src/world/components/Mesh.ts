import {Component} from "ape-ecs";
import device from "@gpu/device.ts";


import {positionColorUvPipeline} from "@gpu/pipelines.ts";


export default class Mesh extends Component {
    buffers: GPUBuffer[] = [];
    indexBuffer: GPUBuffer;
    pipeline: GPURenderPipeline = positionColorUvPipeline;
    numVertices: number = 0;
    numElements: number = 0;

    init(initial: any) {
        super.init(initial);

        const positions = new Float32Array(initial.positions);
        this.buffers[0] = device.createBuffer({
            label: "Position Buffer",
            size: positions.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffers[0], 0, positions);
        this.numVertices = positions.length / 3;

        const colors = new Float32Array(initial.colors);
        this.buffers[1] = device.createBuffer({
            label: "Color Buffer",
            size: colors.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffers[1], 0, colors);

        const uvs = new Float32Array(initial.uvs);
        this.buffers[2] = device.createBuffer({
            label: "UV Buffer",
            size: uvs.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffers[2], 0, uvs);

        //
        const indices = new Uint32Array(initial.indices);
        this.indexBuffer = device.createBuffer({
            label: "Index Buffer",
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.indexBuffer, 0, indices);
        this.numElements = indices.length;

        //
        if(!!initial.pipeline)
            this.pipeline = positionColorUvPipeline;
    }


    destroy() {
        this.indexBuffer.destroy();
        this.buffers.forEach(buffer => buffer.destroy());

        super.destroy();
    }
}

Mesh.properties = {
    buffers: Array<GPUBuffer>(),
    indexBuffer: null,
    indices: [],
    positions: [],
    uvs: [],
    colors: [], // should this be a uniform instead?
    numVertices: 0,
    pipeline: positionColorUvPipeline
};