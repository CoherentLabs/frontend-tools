/// <reference types="vite/client" />
/// <reference types="vite-plugin-gameface-styles/vue" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
