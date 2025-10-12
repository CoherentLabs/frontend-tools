import generateCode from './factory';
import { GFImage } from './types/commonTypes';
import generateCSSBoilerplate from './utils/cssBoilerplate';
import { currentPageSize } from './utils/currentPage';
import generateHTMLBoilerplate from './utils/htmlBoilerplate';
import sanitizeNames from './utils/sanitizeNames';

type ExporterResult = {
    [pageName: string]: {
        html: string;
        css: string;
        images: Array<{ name: string; data: Uint8Array | null }>;
    };
};

async function getPages(): Promise<ExporterResult> {
    const results = {} as ExporterResult;
    const pages = figma.currentPage.children.filter((node) => node.visible && node.type === 'FRAME');

    for (const page of pages) {
        currentPageSize.set({ width: page.width, height: page.height });
        const { html, css, images } = await generateCode(page as FrameNode);
        
        results[sanitizeNames(page.name)] = {
            html: generateHTMLBoilerplate(html, page.name),
            css: generateCSSBoilerplate() + css,
            images,
        };
    }

    return results;
}

export async function getNodes(children: readonly SceneNode[]): Promise<{ html: string; css: string; images: GFImage[]}> {
    const results: { html: string; css: string; images: GFImage[] } = { html: '', css: '', images: [] };

    if (!children || children.length === 0) {
        return results;
    }

    for (const child of children) {
        const { html, css, images } = await generateCode(child);
        results.html += html;
        results.css += css;
        results.images = results.images.concat(images);
    }
    return results;
}

export default getPages;
