declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    [key: `style:${string}`]: any;
  }
}