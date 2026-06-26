import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import UnoCSS from 'unocss/vite';
import gamefaceStyleTransformerPlugin from 'vite-plugin-gameface-styles';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  plugins: [
    ...gamefaceStyleTransformerPlugin({ suppressWarnings: false, isSolidProject: false }),
    preact(),
    UnoCSS(),
  ],
  base: './',
  server: {
    port: 3000,
  },
  build: {
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    cssTarget: ['chrome120', 'safari16'],
  }
});
