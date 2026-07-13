// Minimal type declarations for `tiged` (a degit fork).
// tiged@2.x ships no types and there is no @types/tiged on DefinitelyTyped,
// so we declare just the surface this CLI uses.
declare module 'tiged' {
  export interface Options {
    /** Overwrite files in a non-empty destination. */
    force?: boolean;
    /** Bypass the local `~/.degit` cache and always fetch fresh. */
    disableCache?: boolean;
    /** Use only the local cache; never touch the network. */
    offlineMode?: boolean;
    /** Emit verbose logging via the `info`/`warn` events. */
    verbose?: boolean;
    /** Extraction strategy. Defaults to `'tar'`. */
    mode?: 'tar' | 'git';
    /**
     * @deprecated Backward-compat alias, does NOT disable the on-disk cache.
     * Use `disableCache` instead.
     */
    cache?: boolean;
  }

  export interface Info {
    code: string;
    message: string;
    repo?: unknown;
    dest?: string;
  }

  export interface Emitter {
    clone(dest: string): Promise<void>;
    on(event: 'info' | 'warn', callback: (info: Info) => void): this;
  }

  export default function tiged(src: string, opts?: Options): Emitter;
}
