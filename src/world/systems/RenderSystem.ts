import {Query, System} from "ape-ecs";
import {mat4} from "gl-matrix";
import device, {context} from "@gpu/device.ts";

import Mesh from "../components/Mesh.ts";
import Transform from "../components/Transform.ts";
import MetaValues from "../components/MetaValues.ts";
import Material from "../components/Material.ts";

import {positionColorUvPipeline} from "@gpu/pipelines.ts";


let meshQuery: Query,
    buffers: GPUBuffer[],
    projectionViewBindGroup: GPUBindGroup,
    colorTexture: GPUTexture,
    depthTexture: GPUTexture;


/**
 * @property query Query
 */
export default class RenderSystem extends System {

    init(...initArgs) {
        super.init(...initArgs);

        meshQuery = this.createQuery()
            .fromAll(Mesh.name, Transform.name, Material.name).persist();

        // create color texture
        colorTexture = device.createTexture({
            size: [context.canvas.width, context.canvas.height],
            format: navigator.gpu.getPreferredCanvasFormat(),
            sampleCount: 4,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        // create depthTexture to have z-ordering
        depthTexture = device.createTexture({
            size: [context.canvas.width, context.canvas.height],
            format: 'depth24plus',
            sampleCount: 4,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        })

        // create buffers
        buffers = new Array<GPUBuffer>(2);
        buffers[0] = device.createBuffer({
            label: "Projection Buffer",
            size: 16 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        buffers[1] = device.createBuffer({
            label: "View Buffer",
            size: 16 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        projectionViewBindGroup = device.createBindGroup({
            label: "BindGroup Component",
            layout: positionColorUvPipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: buffers[0] }
            }, {
                binding: 1,
                resource: { buffer: buffers[1] }
            }]
        });
    }

    update(tick: number) {
        super.update(tick);

        device.queue.writeBuffer(buffers[0], 0, mat4.perspective(mat4.create(), 45 * Math.PI / 180, 1024 / 768, .1, 100));
        device.queue.writeBuffer(buffers[1], 0, mat4.lookAt(mat4.create(), [0, 5, 5], [0, 0, 0], [0, 1, 0]));

        const encoder = device.createCommandEncoder();

        let renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                loadOp: "clear",
                storeOp: "store",
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                view: colorTexture.createView(),
                resolveTarget: context.getCurrentTexture().createView()
            }],
            depthStencilAttachment: {
                depthClearValue: 1.0,
                depthLoadOp: "clear",
                depthStoreOp: "store",
                view: depthTexture.createView()
            }
        });

        renderPass.setBindGroup(0, projectionViewBindGroup);
        meshQuery.refresh().execute().forEach(e => {
            const mesh = <Mesh> e.getOne(Mesh.name),
                transform = <Transform> e.getOne(Transform.name),
                material = <Material> e.getOne(Material.name);

            //
            if(!e.has(MetaValues.name)) {
                const meta = {
                    type: MetaValues.name,

                    modelBindGroup: device.createBindGroup({
                        label: "Model BindGroup",
                        layout: positionColorUvPipeline.getBindGroupLayout(1),
                        entries: [{
                            binding: 0,
                            resource: { buffer: transform.buffer }
                        }]
                    }),

                    materialBindGroup: device.createBindGroup({
                        label: "Material BindGroup",
                        layout: positionColorUvPipeline.getBindGroupLayout(2),
                        entries: [{
                            binding: 0,
                            resource: material.sampler
                        }, {
                            binding: 1,
                            resource: material.texture.createView()
                        }]
                    })
                }

                e.addComponent(meta);
            }

            const meta = e.getOne(MetaValues.name) as MetaValues;
            device.queue.writeBuffer(transform.buffer, 0, transform.model);

            renderPass.setPipeline(mesh.pipeline);
            renderPass.setBindGroup(1, meta.modelBindGroup);
            renderPass.setBindGroup(2, meta.materialBindGroup);

            renderPass.setVertexBuffer(0, mesh.buffers[0]);
            renderPass.setVertexBuffer(1, mesh.buffers[1]);
            renderPass.setVertexBuffer(2, mesh.buffers[2]);

            if(mesh.numElements > 0) {
                renderPass.setIndexBuffer(mesh.indexBuffer, "uint32");
                renderPass.drawIndexed(mesh.numElements, 1);
            } else {
                renderPass.draw(mesh.numVertices, 1);
            }
        });

        renderPass.end();

        device.queue.submit([encoder.finish()])
    }
}