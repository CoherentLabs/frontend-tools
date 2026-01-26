import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    plugins: [
        dts({
            rollupTypes: true,
            outDir: 'dist/types',
            tsconfigPath: './tsconfig.json',
        }),
        viteStaticCopy({
            targets: [
                {
                    src: 'src/global.d.ts',
                    dest: '../dist/types' // Copies to dist/types/global.d.ts
                }
            ]
        })
    ],
    esbuild: {
        keepNames: true,
    },
    build: {
        outDir: 'esm',
        minify: false,
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, 'src/interaction-manager.ts'),
            name: 'interaction-manager',
            formats: ['es'],
            fileName: (_, name) => `${name}.js`,
        },
    },
});