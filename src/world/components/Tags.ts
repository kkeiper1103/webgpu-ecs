import {Component} from "@jakeklassen/ecs";


export class PlayerTag extends Component {}
export class MapTag extends Component {
    constructor(public heights: number[], public width: number, public depth: number) {
        super();
    }

    // gets the height at a specified location, using bilinear interpolation between integers.
    height(x: number, z: number): number {
        // Find the integer positions surrounding the current position
        let baseX = Math.floor(x);
        let baseZ = Math.floor(z);

        // Calculate interpolation weights
        let fracX = x - baseX;
        let fracZ = z - baseZ;

        // Interpolate height values. For simplicity, we're doing a bilinear interpolation
        // assuming a square grid. For more complex heightmap data, consider other interpolation methods.
        let height00 = this.heights[baseZ * this.width + baseX]; // Bottom-left
        let height01 = this.heights[(baseZ + 1) * this.width + baseX]; // Top-left
        let height10 = this.heights[baseZ * this.width + (baseX + 1)]; // Bottom-right
        let height11 = this.heights[(baseZ + 1) * this.width + (baseX + 1)]; // Top-right

        // Interpolate between the points
        let heightZ0 = (1 - fracX) * height00 + fracX * height10; // Interpolate along bottom row
        let heightZ1 = (1 - fracX) * height01 + fracX * height11; // Interpolate along top row

        return (1 - fracZ) * heightZ0 + fracZ * heightZ1; // Interpolate between the two rows
    }
}