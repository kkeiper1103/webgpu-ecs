import {Component} from "ape-ecs";
import device from "@gpu/device.ts";


import {positionColorUvPipeline} from "@gpu/pipelines.ts";


export default class Mesh extends Component {
    static nextId: number = 1;
    _id: number = 0;


    buffers: GPUBuffer[] = [];
    indexBuffer: GPUBuffer;
    pipeline: GPURenderPipeline = positionColorUvPipeline;
    numVertices: number = 0;
    numElements: number = 0;

    init(initial: any) {
        super.init(initial);

        this._id = Mesh.nextId++;

        const positions = new Float32Array(initial.positions);
        this.buffers[0] = device.createBuffer({
            label: "Position Buffer for Mesh #" + this._id,
            size: positions.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffers[0], 0, positions);
        this.numVertices = positions.length / 3;

        const colors = new Float32Array(initial.colors);
        this.buffers[1] = device.createBuffer({
            label: "Color Buffer for Mesh #" + this._id,
            size: colors.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffers[1], 0, colors);

        const uvs = new Float32Array(initial.uvs);
        this.buffers[2] = device.createBuffer({
            label: "UV Buffer for Mesh #" + this._id,
            size: uvs.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffers[2], 0, uvs);

        let indices = initial.indices || generateIndices(initial.positions);

        //
        indices = new Uint16Array(indices);
        this.indexBuffer = device.createBuffer({
            label: "Index Buffer for Mesh #" + this._id,
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.indexBuffer, 0, indices);
        this.numElements = indices.length;

        //
        if(!!initial.pipeline)
            this.pipeline = positionColorUvPipeline;

        // ?
        this.update();
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

function generateIndices(positions: number[]): number[] {
    return Array.from({length: positions.length / 3}, (_, index) => index);
}

function range(start: number, end: number): number[] {
    const length = end - start + 1;
    let arr = Array.from({ length }, (_, i) => start + i);

    console.log('generating index array for non-indexed geometry', arr);

    return arr;
}