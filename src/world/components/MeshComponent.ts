import {Component} from "ape-ecs";
import device from "../../gpu/device.ts";

export default class MeshComponent extends Component {
    buffers: GPUBuffer[] = [];

    init(initial: any) {
        super.init(initial);

        console.log(initial);

        let data = new Float32Array(initial.positions);
        this.buffers[0] = device.createBuffer({
            label: "Position Buffer",
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffers[0], 0, data);

        data = new Float32Array(initial.colors);
        this.buffers[1] = device.createBuffer({
            label: "Color Buffer",
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffers[1], 0, data);
    }


    destroy() {
        this.buffers.forEach(buffer => buffer.destroy());

        super.destroy();
    }
}