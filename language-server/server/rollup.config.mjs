import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
    input: "src/server.ts",
    output: [
        {
            file: "out/server.js",
            format: "cjs",
        },
    ],
    context: 'this',
    plugins: [
        resolve({ preferBuiltins: false }),
        commonjs(),
        typescript({ tsconfig: "./tsconfig.prod.json" }),
        terser()
    ],
    external: ["vscode", 'path', 'util', 'child_process', 'fs', 'crypto', 'net', 'url'],
};
