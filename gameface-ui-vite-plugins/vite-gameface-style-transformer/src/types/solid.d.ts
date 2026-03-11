import 'solid-js';

declare module 'solid-js' {
    namespace JSX {
        interface HTMLAttributes<T> {
            [key: `style:${string}`]: JSX.CSSProperties | string | undefined;
        }
    }
}
