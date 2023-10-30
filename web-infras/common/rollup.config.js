import typescriptPlugin from "@rollup/plugin-typescript";
import { dts as typescriptTypePlugin } from "rollup-plugin-dts";
import path from "path";

/** @type {import('rollup').RollupOptions} */
export default [
    {
        input: 'src/index.ts',
        output: {
            file: './dist/index.js',
            format: 'cjs'
        },
        plugins: [
            typescriptPlugin({
                tsconfig: path.join(__dirname, "tsconfig.json"),
            }),
        ]
    },
    {
        input: 'src/index.ts',
        output: {
            file: './dist/index.d.ts',
            format: 'es'
        },
        plugins: [
            typescriptPlugin({
                tsconfig: path.join(__dirname, "tsconfig.json"),
            }),
            typescriptTypePlugin()
        ]
    }
];