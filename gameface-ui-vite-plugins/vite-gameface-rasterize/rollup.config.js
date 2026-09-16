import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

const shared = {
    plugins: [
        json(),
        resolve({ preferBuiltins: true }),
        commonjs(),
        typescript({
            tsconfig: "./tsconfig.json",
            compilerOptions: {
                noEmit: false,
                emitDeclarationOnly: false,
                declaration: true,
                declarationDir: "./dist",
            },
        }),
    ],
    // sharp and chrome-remote-interface both carry native/dynamic requires that must
    // stay external; vite is a peer dependency.
    external: ["vite", "sharp", "chrome-remote-interface", /^node:/],
};

export default [
    {
        input: { index: "src/index.ts", contract: "src/contract.ts" },
        output: [{ dir: "dist", format: "esm", sourcemap: true, entryFileNames: "[name].js" }],
        ...shared,
    },
    {
        input: "src/cli.ts",
        output: [{ file: "dist/cli.js", format: "esm", sourcemap: true, banner: "#!/usr/bin/env node" }],
        ...shared,
    },
];
