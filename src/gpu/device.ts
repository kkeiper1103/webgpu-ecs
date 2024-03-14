let adapter = await navigator.gpu.requestAdapter() as GPUAdapter,
    device = await adapter.requestDevice();

let canvas: HTMLCanvasElement = document.querySelector("#app"),
    context: GPUCanvasContext = <GPUCanvasContext> canvas.getContext("webgpu");

context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat()
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
window.dispatchEvent(new Event('resize'));

export default device;

export {
    device,
    adapter,
    canvas,
    context,
}