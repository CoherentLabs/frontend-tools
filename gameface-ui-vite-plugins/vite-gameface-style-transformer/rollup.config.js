import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';

export default {
    input: "src/index.ts",
    output: [
        {
            file: "dist/index.js",
            format: "esm",
            sourcemap: true,
        },
    ],
    plugins: [
        json(),
        resolve(),
        commonjs(),
        typescript({ 
            tsconfig: "./tsconfig.json",
            // OVERRIDE TSCONFIG TO FORCE JAVASCRIPT EMISSION
            compilerOptions: {
                noEmit: false,
                emitDeclarationOnly: false,
                declaration: true,         // Ensure it still generates index.d.ts
                declarationDir: "./dist"   // Put the generated index.d.ts in the dist folder
            }
        }),
        copy({
            targets: [
                { src: 'src/types/*', dest: 'dist/types' } 
            ]
        })
    ],
    // Make sure 'magic-string' and 'unocss' aren't accidentally bundled into your plugin
    external: ["vite", "magic-string", "unocss"],
};