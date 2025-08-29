import fs from 'node:fs';
import path from 'node:path';

export function getDownloads() {
    const dir = path.join(process.cwd(), 'public', 'data-binding-autocomplete');

    return fs.readdirSync(dir).filter((file) => file.endsWith('.vsix')).map((file) => {
        return {
            name: file,
            url: `/data-binding-autocomplete/${file}`,
        }
    });
}