# rasterize demo

One page covering every mode and every interesting diagnostic.

| Element | What it demonstrates |
|---|---|
| `.panel` | slice mode - rounded and shadowed, width fixed but height decided by its content |
| `.badge` | flat mode - fixed size, so the gradient can be baked as one image |
| `.cta` | state variants - base, hover and active each get their own texture |
| `.nameplate` | element mode - the frame, portrait and label bake into one image; the bound name, the HP fill and the report button stay live |
| `.blended` | **RZ001 on purpose** - `mix-blend-mode` cannot be baked, and the build fails |
| `.animated` | **RZ002 on purpose** - a transitioned shadow warns that variants swap instantly |
| `.unmarked` | the advisor - expensive properties with no marker, reported as info |

The build is **expected to fail** with one RZ001 error. That is the demonstration: the tool
refuses to bake something it cannot reproduce, rather than approximating it. The assets are
still written, so the output is inspectable.

## Running it

```shell
# as a plain directory
node ../../dist/cli.js bake .
node ../../dist/cli.js verify .

# or through Vite, with a vite.config that registers the plugin
npx vite build
```

Set `GAMEFACE_PATH` first.

## What verification reports

All seven comparisons - including the flattened nameplate and the slice panel stretched to three
different sizes - come back at SSIM 1.0000.
