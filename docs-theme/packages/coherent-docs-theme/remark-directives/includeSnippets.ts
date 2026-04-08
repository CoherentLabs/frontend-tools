import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { visit } from 'unist-util-visit';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { mdxjs } from 'micromark-extension-mdxjs';
import { directive } from 'micromark-extension-directive';
import { directiveFromMarkdown } from 'mdast-util-directive';
import { gfm } from 'micromark-extension-gfm';
import { gfmFromMarkdown } from 'mdast-util-gfm';

import type { Root, Content, Heading } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';

type SnippetTag = "changelog" | "rendering" | "content_development" | "migration" | "core" | "unreal_engine" | 'unity';

interface TagConfig {
    title: string;
    level: 1 | 2 | 3;
}

const TAG_CONFIG: Record<SnippetTag, TagConfig> = {
    changelog: { title: "Changelog", level: 1 },
    migration: { title: "Migration guide", level: 1 },
    content_development: { title: "Content Development", level: 2 },
    core: { title: "Core", level: 2 },
    rendering: { title: "Rendering", level: 2 },
    unreal_engine: { title: "Unreal Engine", level: 2 },
    unity: { title: "Unity", level: 2 },
};

const isDev = process.env.NODE_ENV === 'development' || process.env.MODE === 'development';

function getAllSnippetFiles(dirPath: string, arrayOfFiles: string[] = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllSnippetFiles(fullPath, arrayOfFiles);
        } else {
            if ((file.endsWith('.md') || file.endsWith('.mdx'))) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

export function remarkIncludeSnippets() {
    return (tree: Root) => {

        visit(tree, 'mdxJsxFlowElement', (node: MdxJsxFlowElement, index, parent) => {
            if (node.name !== 'IncludeSnippets' || index === undefined || !parent) return;

            const attrs = Object.fromEntries(
                node.attributes.map((attr) => {
                    if ('name' in attr && 'value' in attr) {
                        return [attr.name, attr.value];
                    }
                    return [];
                })
            );

            const release = attrs.release as string;
            const tag = attrs.tag as SnippetTag;
            const noBullets = attrs.noBullets === 'true' || attrs.noBullets === true;

            const currentConfig = TAG_CONFIG[tag];
            if (!currentConfig || !release) return;

            const folderName = release === 'next_release' ? 'next_release' : `Release_${release}`;
            let releaseDir = path.resolve(`./src/content/docs/Releases/${folderName}/`);

            if (release !== 'next_release' && !fs.existsSync(releaseDir)) {
                const versionDir = path.resolve(`./src/content/docs/Releases/Version_${release}/`);
                if (fs.existsSync(versionDir)) {
                    releaseDir = versionDir;
                }
            }

            if (release === 'next_release' && !isDev) {
                parent.children.splice(index, 1);
                return index;
            }

            const injectedNodes: Content[] = [];

            if (fs.existsSync(releaseDir)) {
                const snippetFiles = getAllSnippetFiles(releaseDir);
                const matchingSnippets: Array<{ data: any; content: string }> = [];

                for (const filePath of snippetFiles) {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    const { data, content } = matter(fileContent);

                    if (data?.tag === tag && data?.draft !== true) {
                        matchingSnippets.push({ data, content });
                    }
                }

                matchingSnippets.sort((a, b) => (a.data.weight || 0) - (b.data.weight || 0));

                if (matchingSnippets.length > 0) {
                    injectedNodes.push({
                        type: 'heading',
                        depth: currentConfig.level as Heading['depth'],
                        data: {
                            hProperties: {
                                id: currentConfig.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                            }
                        },
                        children: [{ type: 'text', value: currentConfig.title }]
                    } as Heading);

                    for (const snippet of matchingSnippets) {
                        if (!noBullets && snippet.data.title) {
                            injectedNodes.push({
                                type: 'heading',
                                depth: 3,
                                children: [{ type: 'text', value: snippet.data.title }]
                            } as Heading);
                        }

                        const snippetAst = fromMarkdown(snippet.content, {
                            extensions: [mdxjs(), directive(), gfm()],
                            mdastExtensions: [mdxFromMarkdown(), directiveFromMarkdown(), gfmFromMarkdown()]
                        });

                        visit(snippetAst, 'containerDirective', (directiveNode: any) => {
                            const asideType = directiveNode.name || 'note';
                            const asideTitle = asideType.charAt(0).toUpperCase() + asideType.slice(1);

                            directiveNode.type = 'mdxJsxFlowElement';
                            directiveNode.name = 'aside';
                            directiveNode.attributes = [
                                { type: 'mdxJsxAttribute', name: 'class', value: `starlight-aside starlight-aside--${asideType}` },
                                { type: 'mdxJsxAttribute', name: 'aria-label', value: asideTitle }
                            ];

                            const titleNode = {
                                type: 'mdxJsxFlowElement',
                                name: 'p',
                                attributes: [
                                    { type: 'mdxJsxAttribute', name: 'class', value: 'starlight-aside__title' },
                                    { type: 'mdxJsxAttribute', name: 'aria-hidden', value: 'true' }
                                ],
                                children: [{ type: 'text', value: asideTitle }]
                            };

                            const contentNode = {
                                type: 'mdxJsxFlowElement',
                                name: 'section',
                                attributes: [
                                    { type: 'mdxJsxAttribute', name: 'class', value: 'starlight-aside__content' }
                                ],
                                children: directiveNode.children
                            };

                            directiveNode.children = [titleNode, contentNode];
                        });

                        injectedNodes.push(...(snippetAst.children as Content[]));
                    }
                }
            }

            if (injectedNodes.length > 0) {
                parent.children.splice(index, 1, ...injectedNodes);
                return index + injectedNodes.length;
            } else {
                parent.children.splice(index, 1);
                return index;
            }
        });
    };
}