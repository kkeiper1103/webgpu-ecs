import {Query, System} from "ape-ecs";
import {mat4} from "gl-matrix";
import device, {context} from "../../gpu/device.ts";

import MeshComponent from "../components/MeshComponent.ts";
import TransformComponent from "../components/TransformComponent.ts";
import MetaValuesComponent from "../components/MetaValuesComponent.ts";

import {pipeline} from "../components/MeshComponent.ts";

/**
 * @property query Query
 */
export default class RenderSystem extends System {

    init(...initArgs) {
        super.init(...initArgs);

        this.query = this.createQuery()
            .fromAll(MeshComponent.name, TransformComponent.name);


        // create buffers
        this.buffers = new Array<GPUBuffer>(2);
        this.buffers[0] = device.createBuffer({
            label: "Projection Buffer",
            size: 16 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.buffers[1] = device.createBuffer({
            label: "View Buffer",
            size: 16 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.projectionViewBindgroup = device.createBindGroup({
            label: "BindGroup Component",
            layout: pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: this.buffers[0] }
            }, {
                binding: 1,
                resource: { buffer: this.buffers[1] }
            }]
        });
    }

    update(tick: number) {
        super.update(tick);

        device.queue.writeBuffer(this.buffers[0], 0, mat4.perspective(mat4.create(), 45 * Math.PI / 180, 1024 / 768, .1, 100));
        device.queue.writeBuffer(this.buffers[1], 0, mat4.lookAt(mat4.create(), [0, 5, 5], [0, 0, 0], [0, 1, 0]));




        const encoder = device.createCommandEncoder();

        let renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                loadOp: "clear",
                storeOp: "store",
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                view: context.getCurrentTexture().createView()
            }]
        });

        renderPass.setBindGroup(0, this.projectionViewBindgroup);

        this.query.execute().forEach(e => {
            const mesh = <MeshComponent> e.getOne(MeshComponent.name),
                transform = <TransformComponent> e.getOne(TransformComponent.name);

            //
            if(!e.has(MetaValuesComponent.name)) {
                const meta = {
                    type: MetaValuesComponent.name,

                    modelBindGroup: device.createBindGroup({
                        label: "Model BindGroup",
                        layout: pipeline.getBindGroupLayout(1),
                        entries: [{
                            binding: 0,
                            resource: { buffer: transform.buffer }
                        }]
                    }),

                    materialBindGroup: device.createBindGroup({
                        label: "Material BindGroup",
                        layout: pipeline.getBindGroupLayout(2),
                        entries: [{
                            binding: 0,
                            resource: device.createSampler()
                        }, {
                            binding: 1,
                            resource: device.createTexture({
                                format: 'rgba8unorm',
                                size: [128, 128],
                                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST
                            }).createView()
                        }]
                    })
                }

                e.addComponent(meta);
            }

            const meta = e.getOne(MetaValuesComponent.name) as MetaValuesComponent;
            device.queue.writeBuffer(transform.buffer, 0, transform.model);

            renderPass.setPipeline(mesh.pipeline);
            renderPass.setBindGroup(1, meta.modelBindGroup);
            renderPass.setBindGroup(2, meta.materialBindGroup);
            renderPass.setVertexBuffer(0, mesh.buffers[0]);
            renderPass.setVertexBuffer(1, mesh.buffers[1]);
            renderPass.draw(mesh.numVertices);
        });

        renderPass.end();

        device.queue.submit([encoder.finish()])
    }
}
