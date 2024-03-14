import {System} from "ape-ecs";
import device, {context} from "../../gpu/device.ts";

export default class RenderSystem extends System {

    init(...initArgs) {
        super.init(...initArgs);

        this.query = this.createQuery().fromAll("MeshComponent");
    }

    update(tick: number) {
        super.update(tick);

        const encoder = device.createCommandEncoder();
        let computePass = encoder.beginComputePass({

        });

        computePass.end();

        let renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                loadOp: "clear",
                storeOp: "store",
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                view: context.getCurrentTexture().createView()
            }]
        });

        this.query.execute().forEach(e => {

        });

        renderPass.end();

        device.queue.submit([encoder.finish()])
    }
}