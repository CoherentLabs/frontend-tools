import '@vue/runtime-dom';

declare module '@vue/runtime-dom' {
    interface HTMLAttributes {
        [key: `style:${string}`]: any;
    }
}
