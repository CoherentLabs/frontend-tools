import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { visit } from 'unist-util-visit';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { mdxjs } from 'micromark-extension-mdxjs';
import type { Root, Content, Heading } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';

type SnippetTag = "changelog" | "rendering" | "content_development" | "migration" | "core" | "unreal_engine";

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
};

const isDev = process.env.NODE_ENV === 'development' || process.env.MODE === 'development';

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
            const releaseDir = path.resolve(`./src/content/docs/releases/${folderName}/`);

            if (release === 'next_release' && !isDev) {
                parent.children.splice(index, 1);
                return index;
            }

            const injectedNodes: Content[] = [];

            if (fs.existsSync(releaseDir)) {
                const files = fs.readdirSync(releaseDir);
                const matchingSnippets: Array<{ data: any; content: string }> = [];

                for (const fileName of files) {
                    if (!fileName.startsWith('_')) continue;
                    if (!fileName.endsWith('.md') && !fileName.endsWith('.mdx')) continue;

                    const filePath = path.join(releaseDir, fileName);
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
                            extensions: [mdxjs()],
                            mdastExtensions: [mdxFromMarkdown()]
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