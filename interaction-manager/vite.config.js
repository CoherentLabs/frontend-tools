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
    build: {
        outDir: 'esm',
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, 'src/interaction-manager.ts'),
            name: 'interaction-manager',
            formats: ['es'],
            fileName: (format, name) => `${name}.js`,
        },
        rollupOptions: {
            external: [],
        },
    },
});