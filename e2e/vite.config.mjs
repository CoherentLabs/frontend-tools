import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { builtinModules } from 'module';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GamefaceE2E',
      fileName: 'index',
      formats: ['cjs']
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        'ws', 'axios', 'glob', 'mocha', '@oclif/core', 'detect-port'
      ]
    }
  },
  plugins: [
    dts({
      rollupTypes: false,
      outDir: 'dist',
      tsconfigPath: './tsconfig.json',
    }),
  ],
});