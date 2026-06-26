import { defineConfig } from 'unocss';
import { presetGameface } from 'vite-plugin-gameface-styles';

export default defineConfig({
  presets: [presetGameface()],
 // 1. Block utilities that generate dots or invalid chars in CSS selectors
  blocklist: [
    /\./,          // Blocks fractional utilities like w-1.5, p-0.5, top-2.5
    /^\[.*\]$/,   // Blocks arbitrary values like w-[200px] which break Gameface
    /^\d/,         // Blocks any utility starting with a number
  ],
});
