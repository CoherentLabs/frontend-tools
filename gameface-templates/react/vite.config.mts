import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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
    react(),
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
