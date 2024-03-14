import {vec3, mat4, quat} from 'gl-matrix'
import device from "../../gpu/device.ts";
import {Component} from "ape-ecs";

export default class Transform extends Component {
    buffer: GPUBuffer;

    protected _quat: quat = quat.create();
    protected _model: mat4 = mat4.create();

    init(initial: any) {
        super.init(initial);

        this.buffer = device.createBuffer({
            label: "model buffer",
            size: 16 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(this.buffer, 0, this.model);
    }

    destroy() {
        this.buffer.destroy();

        super.destroy();
    }

    get model(): mat4 {
        quat.fromEuler(this._quat, this.rotation[0], this.rotation[1], this.rotation[2]);
        mat4.fromRotationTranslationScaleOrigin(this._model, this._quat, this.position, this.scale, this.origin)

        return this._model;
    }
}

type TransformComponentPropertiesType = {
    position: vec3,
    rotation: vec3,
    scale: vec3,
    origin: vec3
};
Transform.properties = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    origin: [0, 0, 0]
};