import {Component} from "@jakeklassen/ecs";
import device from "@gpu/device.ts";
import {positionColorUvPipeline} from "@gpu/pipelines.ts";

type Props = {
    size: Array<number>,

    textureDescriptor: GPUTextureDescriptor,
    samplerDescriptor: GPUSamplerDescriptor,

    pixels?: number[] | Uint8ClampedArray,
    image?: ImageBitmap
};

export default class Material extends Component {

    static nextId: number = 1;
    _id: number = 0;

    texture: GPUTexture;
    sampler: GPUSampler;

    bindgroup: GPUBindGroup;

    constructor(initial: Props) {
        super();

        this._id = Material.nextId++;

        let size = initial.size;
        if(initial.image) size = [initial.image.width, initial.image.height];

        let pixels = initial.pixels;
        let textureDescriptor = initial.textureDescriptor;
        textureDescriptor.label = "Texture Handle for Material #" + this._id;

        let samplerDescriptor = initial.samplerDescriptor;
        samplerDescriptor.label = "Sampler Handle for Material #" + this._id;

        // wrap the pixels if they're not a Uint8ClampedArray
        if(!(pixels instanceof Uint8ClampedArray) && Array.isArray(pixels))
            pixels = new Uint8ClampedArray(pixels);

        // pad to 3d image size
        if(size.length == 2) size[2] = 1;

        textureDescriptor.size = size;

        this.texture = device.createTexture(textureDescriptor);
        this.sampler = device.createSampler(samplerDescriptor);

        // if an image bitmap was passed, copy that to the texture
        if(initial.image) {
            device.queue.copyExternalImageToTexture(
                { source: initial.image },
                { texture: this.texture },
                [initial.image.width, initial.image.height]
            );
        }
        // otherwise, copy the given pixels into the texture
        else {
            device.queue.writeTexture(
                {texture: this.texture},
                pixels,
                {
                    bytesPerRow: 4 * size[0],
                    rowsPerImage: size[1]
                },
                {
                    width: size[0],
                    height: size[1],
                    depthOrArrayLayers: size[2]
                }
            );
        }

        this.bindgroup = device.createBindGroup({
            label: "Material BindGroup",
            layout: positionColorUvPipeline.getBindGroupLayout(2),
            entries: [{
                binding: 0,
                resource: this.sampler
            }, {
                binding: 1,
                resource: this.texture.createView()
            }]
        });
    }

    destroy() {
        this.texture.destroy()
    }
}