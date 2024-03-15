import device from "@gpu/device.ts";

import Mesh from "./Mesh.ts";

export default class IndexedMesh extends Mesh {
    indexBuffer: GPUBuffer;

    numElements: number = 0;

    init(initial: any) {
        super.init(initial);

        const indices = new Uint32Array(initial.indices);
        this.indexBuffer = device.createBuffer({
            label: "Index Buffer",
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.indexBuffer, 0, indices);
        this.numElements = indices.length;
    }


    destroy() {
        this.indexBuffer.destroy();

        super.destroy();
    }
}

IndexedMesh.properties.indexBuffer = null;
IndexedMesh.properties.numElements = 0;
IndexedMesh.properties.indices = [];