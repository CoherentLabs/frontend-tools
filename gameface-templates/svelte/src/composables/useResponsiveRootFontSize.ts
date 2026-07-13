import { onDestroy, onMount } from 'svelte';

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const BASE_FONT_SIZE = 20;
const MIN_SCALE = 0.2;
const MAX_SCALE = 1.35;

export function useResponsiveRootFontSize(): void {
  function update(): void {
    const widthScale = window.innerWidth / BASE_WIDTH;
    const heightScale = window.innerHeight / BASE_HEIGHT;
    const rawScale = widthScale < heightScale ? widthScale : heightScale;
    const scale = rawScale < MIN_SCALE
      ? MIN_SCALE
      : rawScale > MAX_SCALE
        ? MAX_SCALE
        : rawScale;

    document.documentElement.style.fontSize = `${BASE_FONT_SIZE * scale}px`;
  }

  onMount(() => {
    update();
    window.addEventListener('resize', update);
  });

  onDestroy(() => {
    window.removeEventListener('resize', update);
  });
}
