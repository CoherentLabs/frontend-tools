import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

export default defineConfig({
    root: __dirname,
    plugins: [devtools(), solidPlugin(), viteSingleFile({ useRecommendedBuildConfig: true })],
    server: {
        port: 3000,
    },
    build: {
        target: 'ES2017',
        outDir: '..',
        emptyOutDir: false,
        assetsInlineLimit: 10000000,
        cssCodeSplit: false,
        rollupOptions: {
            input: resolve(__dirname, 'ui.html'),
            output: {
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
    },
});
