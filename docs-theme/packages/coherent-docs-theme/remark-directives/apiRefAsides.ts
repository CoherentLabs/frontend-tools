import type { Root } from 'mdast';

// Doxybook2 renders Doxygen's `@note`/`@warning` (and every other simplesect: `@return`,
// `@see`, `@since`, etc.) as a paragraph starting with a bold label, in one of two shapes:
//   - inline: "**Note**: body text" all in the same paragraph
//   - block: a paragraph containing only "**Note**", followed by one or more plain paragraphs
//     of body text, with no other marker separating one section from the next
// Starlight has no built-in rendering for these, so recognized labels get turned into the same
// styling as a `:::note`/`:::caution` aside. Unrecognized labels (Returns, See also, ...) are
// left untouched, but still act as a boundary so their content isn't swallowed into a preceding
// note.
//
// This can't just emit a `containerDirective` mdast node (the type `:::note` markdown produces)
// and let Starlight's own remark-asides plugin render it: Starlight's core remark plugins are
// registered by its own `astro:config:setup` hook, which always runs — and so always calls
// `updateConfig` — before this theme's own remark plugins do (Astro's config merging appends
// later `updateConfig` calls after earlier ones), so our nodes would always be created too late
// for Starlight's asides plugin to have seen them. Building the final markup here directly (the
// same mdast/hast "escape hatch" technique Starlight's own asides plugin uses) sidesteps that
// ordering problem entirely, since it needs no later transform to do anything.
const LABEL_TO_ASIDE: Record<string, 'note' | 'caution'> = {
    note: 'note',
    warning: 'caution',
};

// A note/warning's body never spans past the next heading or thematic break — doxybook2 always
// emits simplesects as the trailing content of a member's own documentation block, immediately
// followed by either another simplesect, the next member's heading, or a `---` separator. Without
// this, a body-collecting loop that only stopped at recognized/unrecognized labels would swallow
// everything up to the next label paragraph, including headings, code blocks and tables that
// belong to unrelated content further down the page.
const BODY_BOUNDARY_TYPES = new Set(['heading', 'thematicBreak']);

// Splits a paragraph starting with a bold label into the label text and whatever inline content
// follows it in that same paragraph (the leading ": " doxybook2 puts between the label and the
// inline body is stripped). Returns null if the paragraph doesn't start with a bold label at all
// — used both to recognize note/warning paragraphs and, for every other label (Returns, See
// also, ...), to still treat them as a boundary so their content isn't swallowed into a
// preceding note.
function splitLabelParagraph(node: any): { label: string; rest: any[] } | null {
    if (!node || node.type !== 'paragraph' || !node.children?.length) return null;
    const [first, ...rest] = node.children;
    if (first.type !== 'strong' || first.children?.length !== 1 || first.children[0].type !== 'text') {
        return null;
    }
    const label = first.children[0].value.trim().replace(/:$/, '');
    if (!label) return null;

    if (rest.length > 0 && rest[0].type === 'text') {
        rest[0] = { ...rest[0], value: rest[0].value.replace(/^:\s*/, '') };
    }
    return { label, rest };
}

function h(tagName: string, properties: Record<string, unknown>, children: any[]): any {
    return {
        type: 'paragraph',
        data: { hName: tagName, hProperties: properties },
        children,
    };
}

function buildAside(variant: 'note' | 'caution', title: string, body: any[]): any {
    return h('aside', { className: ['starlight-aside', `starlight-aside--${variant}`], ariaLabel: title }, [
        h('p', { className: ['starlight-aside__title'], ariaHidden: 'true' }, [{ type: 'text', value: title }]),
        h('div', { className: ['starlight-aside__content'] }, body),
    ]);
}

function transformSiblings(nodes: any[]): any[] {
    const recursed = nodes.map((node) => {
        if (Array.isArray(node.children)) {
            node.children = transformSiblings(node.children);
        }
        return node;
    });

    const result: any[] = [];
    for (let i = 0; i < recursed.length; i++) {
        const node = recursed[i];
        const split = splitLabelParagraph(node);
        const variant = split && LABEL_TO_ASIDE[split.label.toLowerCase()];
        if (!split || !variant) {
            result.push(node);
            continue;
        }

        const body: any[] = split.rest.length > 0 ? [{ type: 'paragraph', children: split.rest }] : [];
        let j = i + 1;
        while (
            j < recursed.length &&
            !BODY_BOUNDARY_TYPES.has(recursed[j].type) &&
            splitLabelParagraph(recursed[j]) === null
        ) {
            body.push(recursed[j]);
            j++;
        }
        i = j - 1;

        result.push(buildAside(variant, split.label, body));
    }
    return result;
}

export function remarkDoxygenAsides() {
    return (tree: Root, file: any) => {
        if (!file?.history?.[0]?.toLowerCase().includes('api_reference')) return;
        tree.children = transformSiblings(tree.children) as Root['children'];
    };
}
