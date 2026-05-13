import 'preact';

declare module 'preact' {
  namespace JSX {
    interface HTMLAttributes {
      [key: `style:${string}`]: any;
    }
  }
}