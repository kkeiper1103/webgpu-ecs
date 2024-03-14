@group(0) @binding(0) var<uniform> projection: mat4x4f;
@group(0) @binding(1) var<uniform> view: mat4x4f;
@group(0) @binding(2) var<uniform> viewInverse: mat4x4f;

@group(1) @binding(0) var<uniform> model: mat4x4f;

@group(2) @binding(0) var uSampler: sampler;
@group(2) @binding(1) var uTexture: texture_2d<f32>;

struct VS_OUT {
    @builtin(position) position: vec4f,
    @location(1) uv: vec2f,
    @location(2) normal: vec3f,
    @location(3) color: vec3f
};


@vertex
fn vertex(
    @location(0) a_position: vec3f,
    @location(1) a_uv: vec2f,
    @location(2) a_normal: vec3f,
    @location(3) a_color: vec3f
) -> VS_OUT {
    var out: VS_OUT;

    out.position = projection * view * model * vec4f(a_position, 1.f);
    out.uv = a_uv;
    out.normal = a_normal;
    out.color = a_color;

    return out;
}


@fragment
fn fragment(
    input: VS_OUT
) -> @location(0) vec4f {
    let FragColor: vec4f = vec4f(input.color, 1.f);

    return FragColor;
}