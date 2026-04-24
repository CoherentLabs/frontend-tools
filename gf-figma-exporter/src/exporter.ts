import generateCode from './factory';
import FontExporter from './FontExporter/FontExporter';
import { FontMapData } from './FontExporter/utils/typings';

import { ComponentExportResult, ExportableNodes, GFFont, GFImage } from './types/commonTypes';
import countAllDescendants from './utils/countDescendants';

import createCSSFontRules from './utils/createCSSFontRules';
import generateCSSBoilerplate from './utils/cssBoilerplate';
import { currentPageSize } from './utils/currentPage';
import generateHTMLBoilerplate from './utils/htmlBoilerplate';
import sanitizeNames from './utils/sanitizeNames';
import { progress } from './utils/updateProgress';

type ExporterResult = {
    [pageName: string]: {
        html: string;
        css: string;
        images: Array<{ name: string; data: Uint8Array | null }>;
        fonts?: GFFont;
    };
};

function mergeFontMaps(target: FontMapData, source: FontMapData): FontMapData {
    const result: FontMapData = Object.assign({}, target);
    for (const [family, weights] of Object.entries(source)) {
        if (!result[family]) {
            result[family] = {};
        }
        for (const [weight, styles] of Object.entries(weights)) {
            if (!result[family][weight]) {
                result[family][weight] = {};
            }
            for (const [style, data] of Object.entries(styles)) {
                if (!result[family][weight][style]) {
                    result[family][weight][style] = data;
                } else {
                    result[family][weight][style] = Object.assign(
                        {},
                        result[family][weight][style],
                        { subsets: Object.assign({}, result[family][weight][style].subsets, data.subsets) },
                    );
                }
            }
        }
    }
    return result;
}

function deduplicateName(name: string, existing: Record<string, unknown>): string {
    if (!existing[name]) return name;
    let counter = 2;
    while (existing[`${name}-${counter}`]) counter++;
    return `${name}-${counter}`;
}

async function getPages(): Promise<ExporterResult> {
    
    const results = {} as ExporterResult;
    const pages= figma.currentPage.children.filter((node) => node.visible && node.type === 'FRAME');

    const descendants = countAllDescendants(pages as (BaseNode & ChildrenMixin)[]);
    progress.setDescendants(descendants + (pages.length * 2)); // Adding extra for font processing and per-page setup

    for (const page of pages) {
        progress.update(`Processing page: ${page.name}`);
        currentPageSize.set({ width: page.width, height: page.height });
        (page as FrameNode).clipsContent = false;
        FontExporter.clear();
        await FontExporter.init(page as FrameNode);
        progress.update(`Initialized fonts for page: ${page.name}`);
        const { html, css, images } = await generateCode(page as FrameNode);
        
        results[sanitizeNames(page.name)] = {
            html: generateHTMLBoilerplate(html, page.name),
            css: createCSSFontRules() + generateCSSBoilerplate() + css,
            images,
            fonts: FontExporter.fontMap as GFFont,
        };

        (page as FrameNode).clipsContent = true;
    }

    return results;
}

export async function getComponents(): Promise<ComponentExportResult> {
    const components: ComponentExportResult['components'] = {};
    let mergedFonts: FontMapData = {};

    const topLevelNodes = figma.currentPage.children.filter(
        (node) => node.visible && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'),
    );

    const nodesToCount: (BaseNode & ChildrenMixin)[] = [];
    for (const node of topLevelNodes) {
        if (node.type === 'COMPONENT_SET') {
            nodesToCount.push(...(node as ComponentSetNode).children as unknown as (BaseNode & ChildrenMixin)[]);
        } else {
            nodesToCount.push(node as unknown as BaseNode & ChildrenMixin);
        }
    }
    const descendants = countAllDescendants(nodesToCount);
    progress.setDescendants(descendants + (nodesToCount.length * 2));

    for (const node of topLevelNodes) {
        if (node.type === 'COMPONENT_SET') {
            const setName = sanitizeNames(node.name);
            for (const variant of (node as ComponentSetNode).children) {
                if (!variant.visible) continue;
                progress.update(`Processing component: ${variant.name}`);
                currentPageSize.set({ width: 1920, height: 1080 });
                FontExporter.clear();
                await FontExporter.init(variant as unknown as FrameNode);
                progress.update(`Initialized fonts for component: ${variant.name}`);
                const { html, css, images } = await generateCode(variant as unknown as ExportableNodes, true);
                const variantName = sanitizeNames(setName + '-' + variant.name);
                const safeName = deduplicateName(variantName, components);
                components[safeName] = { html, css, images };
                mergedFonts = mergeFontMaps(mergedFonts, FontExporter.fontMap);
            }
        } else {
            const component = node as ComponentNode;
            progress.update(`Processing component: ${component.name}`);
            currentPageSize.set({ width: 1920, height: 1080 });
            FontExporter.clear();
            await FontExporter.init(component as unknown as FrameNode);
            progress.update(`Initialized fonts for component: ${component.name}`);
            const { html, css, images } = await generateCode(component as unknown as ExportableNodes, true);
            const safeName = deduplicateName(sanitizeNames(component.name), components);
            components[safeName] = { html, css, images };
            mergedFonts = mergeFontMaps(mergedFonts, FontExporter.fontMap);
        }
    }

    const fontsCss = createCSSFontRules(mergedFonts);

    return {
        components,
        fontsCss,
        fonts: mergedFonts as GFFont,
    };
}

export async function getNodes(children: readonly ExportableNodes[]): Promise<{ html: string; css: string; images: GFImage[]}> {
    const results: { html: string; css: string; images: GFImage[] } = { html: '', css: '', images: []};

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
