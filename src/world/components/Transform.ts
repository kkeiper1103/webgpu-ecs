import {vec3, mat4, quat} from 'gl-matrix'
import device from "@gpu/device.ts";
import {Component} from "@jakeklassen/ecs";
import {positionColorUvPipeline} from "@gpu/pipelines.ts";

export default class Transform extends Component {
    static nextId: number = 1;
    _id: number = 0;

    buffer: GPUBuffer;

    protected _quat: quat = quat.create();
    protected _model: mat4 = mat4.create();

    bindgroup: GPUBindGroup;

    constructor(
        public position: vec3 = [0, 0, 0],
        public rotation: vec3 = [0, 0, 0],
        public scale: vec3 = [1, 1, 1],
        public origin: vec3 = [0, 0, 0]
    ) {
        super()

        this._id = Transform.nextId++;

        this.buffer = device.createBuffer({
            label: "Model Buffer for Transform #" + this._id,
            size: 16 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffer, 0, this.model);

        this.bindgroup = device.createBindGroup({
            label: "Model BindGroup",
            layout: positionColorUvPipeline.getBindGroupLayout(1),
            entries: [{
                binding: 0,
                resource: { buffer: this.buffer }
            }]
        });
    }

    destroy() {
        this.buffer.destroy();
    }

    get model(): mat4 {
        quat.fromEuler(this._quat, this.rotation[0], this.rotation[1], this.rotation[2]);
        mat4.fromRotationTranslationScaleOrigin(this._model, this._quat, this.position, this.scale, this.origin)

        return this._model;
    }
}