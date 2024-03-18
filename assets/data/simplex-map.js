import { createNoise2D } from "@xavier.seignard/simplex-noise";
import alea from "alea";

const seed = alea('hello world');
const noise = createNoise2D(seed);

export default noise;

