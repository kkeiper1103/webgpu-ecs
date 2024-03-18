import {System, World} from "@jakeklassen/ecs"

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

    constructor() {
        super();


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
            format: 'depth32float',
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

    update(world: World, dt: number) {

        device.queue.writeBuffer(buffers[0], 0, mat4.perspective(mat4.create(), 45 * Math.PI / 180, context.canvas.width / context.canvas.height, .1, 100));
        device.queue.writeBuffer(buffers[1], 0, mat4.lookAt(mat4.create(), [0, 5, 10], [0, 0, 0], [0, 1, 0]));

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
        renderPass.setViewport(0, 0, context.canvas.width, context.canvas.height, 0, 1);
        renderPass.setScissorRect(0, 0, context.canvas.width, context.canvas.height);

        const entities = world.view(Mesh, Transform, Material);
        for(const [_, componentMap] of entities) {
            const mesh = componentMap.get(Mesh),
                transform = componentMap.get(Transform),
                material = componentMap.get(Material);


            device.queue.writeBuffer(transform.buffer, 0, transform.model);

            renderPass.setPipeline(mesh.pipeline);
            renderPass.setBindGroup(1, transform.bindgroup);
            renderPass.setBindGroup(2, material.bindgroup);

            renderPass.setVertexBuffer(0, mesh.buffers[0]);
            renderPass.setVertexBuffer(1, mesh.buffers[1]);
            renderPass.setVertexBuffer(2, mesh.buffers[2]);

            renderPass.setIndexBuffer(mesh.indexBuffer, "uint16");
            renderPass.drawIndexed(mesh.numElements);
        }

        renderPass.end();

        device.queue.submit([encoder.finish()])
    }
}