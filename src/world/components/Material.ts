import {Component} from "ape-ecs";
import device from "../../gpu/device.ts";

export default class Material extends Component {

    texture: GPUTexture;
    sampler: GPUSampler;

    init(initial: any) {
        super.init(initial);

        let size = initial.size || this.size;
        if(initial.image) size = [initial.image.width, initial.image.height];

        let pixels = initial.pixels || this.pixels;
        let textureDescriptor = initial.textureDescriptor || this.textureDescriptor;
        let samplerDescriptor = initial.samplerDescriptor || this.samplerDescriptor;

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
    }

    destroy() {
        this.texture.destroy()

        super.destroy();
    }
}

Material.properties = {
    texture: undefined,
    sampler: undefined,

    size: [1, 1],

    textureDescriptor: {
        label: "Texture for Material",
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST
    },

    samplerDescriptor: {},

    pixels: new Uint8ClampedArray([255, 255, 255, 255]),
    image: undefined
};