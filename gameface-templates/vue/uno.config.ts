import { defineConfig } from 'unocss';
import { presetGameface } from 'vite-plugin-gameface-styles';

export default defineConfig({
  presets: [presetGameface()],
});
