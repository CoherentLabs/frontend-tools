import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const toCamelCase = (str) => str.replace(/-./g, (word) => word[1].toUpperCase());
// List of modules to build as UMD
const modules = [
    'interaction-manager',
    'actions',
    'draggable',
    'dropzone',
    'gamepad',
    'keyboard',
    'resize',
    'rotate',
    'spatial-navigation',
    'touch-gestures',
    'zoom'
];

const buildUmd = async () => {
    for (const mod of modules) {
        const globalName = toCamelCase(mod);

        await build({
            configFile: false, // Ignore the main vite config
            build: {
                outDir: 'dist',
                emptyOutDir: false,
                sourcemap: true,
                lib: {
                    entry: resolve(rootDir, `src/${mod}.ts`),
                    name: globalName,
                    formats: ['umd'],
                    fileName: () => `${mod}.js`
                },
                rollupOptions: {
                    external: [], 
                }
            }
        });
    }
};

buildUmd();