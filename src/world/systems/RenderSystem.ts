import {Query, System} from "ape-ecs";
import device, {context} from "../../gpu/device.ts";

import MeshComponent from "../components/MeshComponent.ts";

/**
 * @property query Query
 */
export default class RenderSystem extends System {

    init(...initArgs) {
        super.init(...initArgs);

        this.query = this.createQuery().fromAll("MeshComponent");
    }

    update(tick: number) {
        super.update(tick);

        const encoder = device.createCommandEncoder();

        let renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                loadOp: "clear",
                storeOp: "store",
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                view: context.getCurrentTexture().createView()
            }]
        });

        this.query.execute().forEach(e => {
            const mesh = <MeshComponent> e.getOne(MeshComponent.name);

            renderPass.setPipeline(mesh.pipeline);
            renderPass.setVertexBuffer(0, mesh.buffers[0]);
            renderPass.setVertexBuffer(1, mesh.buffers[1]);
            renderPass.draw(mesh.numVertices);
        });

        renderPass.end();

        device.queue.submit([encoder.finish()])
    }
}
