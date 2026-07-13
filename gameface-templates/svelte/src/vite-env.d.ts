/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-gameface-styles/svelte" />

declare module '*.svelte' {
  import type { Component } from 'svelte';
  const component: Component;
  export default component;
}
