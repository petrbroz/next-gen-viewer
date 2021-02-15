import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
    input: './src/main.ts',
    output: {
        file: './build/bundle.js',
        format: 'es'
    },
    plugins: [
        typescript(),
        nodeResolve()
    ]
}