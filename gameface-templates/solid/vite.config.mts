import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import UnoCSS from 'unocss/vite';
import gamefaceStyleTransformerPlugin from 'vite-plugin-gameface-styles';
import solidGameface from 'vite-gameface';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  plugins: [
    ...gamefaceStyleTransformerPlugin({ suppressWarnings: false, isSolidProject: true }),
    solidPlugin({
      solid: {
        omitLastClosingTag: false,
        omitNestedClosingTags: false,
        omitQuotes: false,
      },
    }),
    UnoCSS(),
    solidGameface(),
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
