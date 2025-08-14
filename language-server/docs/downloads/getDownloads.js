import fs from 'node:fs';
import path from 'node:path';

export function getDownloads() {
    const dir = path.join(process.cwd(), 'public', 'data-binding-autocomplete');
    console.log(fs.readdirSync(dir))
    return fs.readdirSync(dir).filter((file) => file.endsWith('.vsix')).map((file) => {
        console.log(file, file.endsWith('.vsix'))
        return {
            name: file,
            url: `/data-binding-autocomplete/${file}`,
        }
    });
}