import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: './src/code.ts',
            output: {
                entryFileNames: 'code.js',
                dir: './',
                format: 'es',
            },
        },
        target: 'esnext',
        minify: false,
    },
});
