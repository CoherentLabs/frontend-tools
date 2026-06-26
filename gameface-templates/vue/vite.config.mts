import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
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
    vue(),
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
