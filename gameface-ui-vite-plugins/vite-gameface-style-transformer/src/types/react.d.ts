import 'react';

declare module 'react' {
    interface HTMLAttributes<T> {
        // Allows any attribute starting with 'style:'
        [key: `style:${string}`]: any;
    }
}
