import generateCode from './factory';
import generateCSSBoilerplate from './utils/cssBoilerplate';
import { currentPageSize } from './utils/currentPage';
import generateHTMLBoilerplate from './utils/htmlBoilerplate';
import sanitizeNames from './utils/sanitizeNames';

type ExporterResult = {
    [pageName: string]: {
        html: string;
        css: string;
    };
};

function getPages(): ExporterResult {
    const results = {} as ExporterResult;
    const pages = figma.currentPage.children.filter((node) => node.visible && node.type === 'FRAME');

    for (const page of pages) {
        currentPageSize.set({ width: page.width, height: page.height });
        const { html, css } = generateCode(page);
        results[sanitizeNames(page.name)] = {
            html: generateHTMLBoilerplate(html, page.name),
            css: generateCSSBoilerplate() + css,
        };
    }

    return results;
}

export function getNodes(children: readonly SceneNode[]): { html: string; css: string } {
    const results = { html: '', css: '' };

    if (!children || children.length === 0) {
        return results;
    }

    for (const child of children) {
        const { html, css } = generateCode(child);
        results.html += html;
        results.css += css;
    }
    return results;
}

export default getPages;
