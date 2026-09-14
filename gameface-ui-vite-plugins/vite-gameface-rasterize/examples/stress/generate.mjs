/**
 * Generates the stress page used for the frame-time numbers in the README.
 *
 * Every card is identical, which is the point twice over: it is enough shadow work to push
 * the engine past its frame cap, and because the cards share a tag and class list they all
 * resolve to one texture - one bake, one upload, N draws.
 *
 * Usage: node generate.mjs [count]
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const count = Number(process.argv[2] ?? 120);
const here = dirname(fileURLToPath(import.meta.url));

const cards = Array.from(
    { length: count },
    (_, i) => `        <div class="card" data-rasterize data-rasterize-mode="flat"><span>${String(i + 1).padStart(3, '0')}</span></div>`
).join('\n');

const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>rasterize stress (${count} cards)</title>
    <link rel="stylesheet" href="./styles.css">
</head>
<body>
    <div class="grid">
${cards}
    </div>
</body>
</html>
`;

writeFileSync(join(here, 'index.html'), html);
console.log(`wrote index.html with ${count} cards`);
