import { isEqual, cloneDeep, uniqWith } from 'lodash';

import { loadFonts, getAllFonts } from '@figma-plugin/helpers';
import { TextSegment } from '../types/commonTypes';

type FontStyleNames =
    | 'fontSize'
    | 'fontName'
    | 'textCase'
    | 'textDecoration'
    | 'letterSpacing'
    | 'lineHeight'
    | 'fills'
    | 'textStyleId'
    | 'fillStyleId'
    | 'fontWeight'
    | 'textDecorationStyle'
    | 'textDecorationColor'
    | 'textDecorationThickness'
    | 'textDecorationOffset';

const styleFonts: FontStyleNames[] = [
    'fontSize',
    'fontName',
    'textCase',
    'textDecoration',
    'textDecorationStyle',
    'textDecorationColor',
    'textDecorationThickness',
    'textDecorationOffset',
    'letterSpacing',
    'lineHeight',
    'fills',
    'textStyleId',
    'fillStyleId',
    'fontWeight',
];



/*
	The function returns the text node styles, splitting them into different arrays, such as:
	[{
		characters: "...",
		... (styles)
	}, ...]

	---

	Returns styles for the entire text:
	parseTextStyle(textNode)
	
	Returns text styles from the 100th to the last character:
	parseTextStyle(textNode, 100)

	Returns styles for the entire text, but only with fontName and textDecoration:
	parseTextStyle(textNode, undefined, undefined, ["fontName", "textDecoration"])
*/

function parseTextStyle(node: TextNode, start = 0, end?: number, styleName?: FontStyleNames[]): TextSegment[] {
    if (!end) end = node.characters.length;
    if (!styleName) styleName = styleFonts;

    if (end <= start) {
        console.error('Start must be greater than end');
        return [];
    }

    // string substring, defined styles
    const styleMap = [];

    // a composing string of a specific style
    let textStyle!: TextSegment;

    const names = styleName.map((name) => {
        return name.replace(/^(.)/g, ($1) => $1.toUpperCase());
    });

    // splitting text into substrings by style

    for (let startIndex = start; startIndex < end; startIndex++) {
        const endIndex = startIndex + 1;
        const letter = {
            characters: node.characters[startIndex],
        } as TextSegment;

        // collection of styles
        names.forEach((name, index) => {
            //@ts-expect-error -- dynamic access
            letter[styleName[index]] = node['getRange' + name](startIndex, endIndex);
        });

        if (textStyle) {
            if (isEqualLetterStyle(letter, textStyle)) {
                // the character has the same properties as the generated substring
                // add it to it
                textStyle.characters += letter.characters;
            } else {
                // style properties are different
                styleMap.push(textStyle);
                // we start to form a new substring
                textStyle = letter;
            }
        } else {
            // we start forming the first substring
            textStyle = letter;
        }
    }

    styleMap.push(textStyle);
    return styleMap;
}

/*
	Allows to split the styles obtained with parseTextStyle into lines based on newlines.

	If the removeNewlineCharacters parameter == true, the newline characters will be removed.
	RemoveEmptylines == true will remove empty lines.
*/

function splitTextStyleIntoLines(textStyle: TextSegment[], removeNewlineCharacters = false, removeEmptylines = false) {
    let line: TextSegment[] = [];
    let lines: TextSegment[][] = [];
    const re = new RegExp('(.+|(?<=\\n)(.?)(?=$))(\\n|\\u2028)?|(\\n|\\u2028)', 'g');
    const re2 = new RegExp('\\n|\\u2028');

    textStyle.forEach((style, index) => {
        if (re2.test(style.characters)) {
            const ls = style.characters.match(re);

            if (ls === null) {
                // text is missing

                line.push(style);
            } else if (ls.length === 1) {
                // the style text consists of 1 line

                line.push(style);
                lines.push(line);
                line = [];
            } else {
                // multiple-line text

                style = cloneDeep(style);
                style.characters = ls.shift()!;
                line.push(style);
                lines.push(line);
                line = [];

                const last = ls.pop();

                // dealing with internal text strings
                lines.push(
                    ...ls.map((e) => {
                        style = cloneDeep(style);
                        style.characters = e;
                        return [style];
                    })
                );

                style = cloneDeep(style);
                style.characters = last!;

                if (last === '') {
                    if (!textStyle[index + 1]) {
                        // last line final
                        lines.push([style]);
                    } // else false end of text
                } else {
                    // does not end
                    line.push(style);
                }
            }
        } else {
            line.push(style);
        }
    });

    if (line.length) lines.push(line);

    // deleting newline characters
    if (removeNewlineCharacters) {
        lines.forEach((l) => {
            const style = l[l.length - 1];
            style.characters = style.characters.replace(re2, '');
        });
    }

    // deleting empty lines
    if (removeEmptylines) {
        lines = lines.filter((l) => l.filter((l) => l.characters.replace(re2, '') !== '').length !== 0);
    }

    return lines;
}

/*
	Inverse function of splitTextStyleIntoLines.
	The addNewlineCharacters parameter is responsible for whether you need to add a newline character at the end of each line
*/

function joinTextLinesStyles(textStyle: TextSegment[][], addNewlineCharacters: boolean | '\n' | '\u2028' = false) {
    const tStyle = cloneDeep(textStyle);
    let newline = '';

    switch (typeof addNewlineCharacters) {
        case 'boolean':
            if (addNewlineCharacters) newline = '\n';
            break;

        case 'string':
            newline = addNewlineCharacters;
            break;
    }

    // adding new line characters
    if (addNewlineCharacters && newline) {
        tStyle.forEach((style: TextSegment[], i: number) => {
            if (i !== tStyle.length - 1) style[style.length - 1].characters += newline;
        });
    }

    // join
    const line = tStyle.shift();
    tStyle.forEach((style: TextSegment[]) => {
        const first = style.shift();

        if (isEqualLetterStyle(first!, line![line!.length - 1])) {
            // the style of the beginning of the line differs from the end of the style of the text being compiled
            line![line!.length - 1].characters += first!.characters;
        } else {
            line!.push(first!);
        }

        if (style.length) line!.push(...style);
    });

    return line;
}

/*
	Apply the text styles obtained from parseTextStyle to the text node.
	The second parameter can be passed a text node, the text of which will be changed.
*/

async function applyTextStyleToTextNode(textStyle: TextSegment[], textNode?: TextNode, isLoadFonts = true) {
    if (isLoadFonts) {
        // use a permissive type so we can combine different font representations
        let fonts: FontName[] = [
            {
                family: 'Roboto',
                style: 'Regular',
            },
        ];

        if (textStyle[0].fontName) {
            fonts.push(...textStyle.map((e) => e.fontName));
        }

        if (textNode) {
            //@ts-expect-error -- dynamic access
            fonts.push(...getAllFonts([textNode]));
        }

        fonts = uniqWith(fonts, isEqual);
        await loadFonts(fonts);
    }

    if (!textNode) textNode = figma.createText();
    textNode.characters = textStyle.reduce((str, style) => {
        return str + style.characters;
    }, '');

    let n = 0;
    textStyle.forEach((style) => {
        const L = style.characters.length;
        if (L) {
            for (const key in style) {
                if (key !== 'characters') {
                    const name = key.replace(/^(.)/g, ($1) => $1.toUpperCase());
                    //@ts-expect-error -- dynamic access
                    textNode['setRange' + name](n, n + L, style[key]);
                }
            }
            n += L;
        }
    });

    return textNode;
}

/*
	Replacing text in textStyle
	If the passed text is shorter than in styles, the extra styles will be removed.
	If the passed text is longer than the styles, the overflow text will get the style of the last character.
*/

function changeCharactersTextStyle(textStyle: TextSegment[], characters: string) {
    textStyle = cloneDeep(textStyle);

    let n = 0;
    const length = textStyle.length - 1;
    const charactersLength = characters.length;
    for (let i = 0; i <= length; i++) {
        const s = textStyle[i];
        let l = s.characters.length;

        // if passed text is longer than text in styles
        if (i == length) l = charactersLength;

        s.characters = characters.slice(n, n + l);
        n += l;

        if (n > charactersLength) {
            // new text is shorter than text in styles
            textStyle = textStyle.splice(0, i + 1);
            continue;
        }
    }

    return textStyle;
}

/*
    Function for changing properties of TextStyle. 
    The beforeValue parameter allows you to specify the value in which the property to be changed should be.
*/

function changeTextStyle(textStyle: TextSegment[], styleName: 'fontSize', newValue: number, beforeValue?: number): TextSegment[];
function changeTextStyle(textStyle: TextSegment[], styleName: 'fontName', newValue: FontName, beforeValue?: FontName): TextSegment[];
function changeTextStyle(textStyle: TextSegment[], styleName: 'textCase', newValue: TextCase, beforeValue?: TextCase): TextSegment[];
function changeTextStyle(
    textStyle: TextSegment[],
    styleName: 'textDecoration',
    newValue: TextDecoration,
    beforeValue?: TextDecoration
): TextSegment[];
function changeTextStyle(
    textStyle: TextSegment[],
    styleName: 'letterSpacing',
    newValue: LetterSpacing,
    beforeValue?: LetterSpacing
): TextSegment[];
function changeTextStyle(
    textStyle: TextSegment[],
    styleName: 'lineHeight',
    newValue: LineHeight,
    beforeValue?: LineHeight
): TextSegment[];
function changeTextStyle(textStyle: TextSegment[], styleName: 'fills', newValue: Paint[], beforeValue?: Paint[]): TextSegment[];
function changeTextStyle(
    textStyle: TextSegment[],
    styleName: 'textStyleId' | 'fillStyleId',
    newValue: string,
    beforeValue?: string
): TextSegment[];
function changeTextStyle(textStyle: TextSegment[], styleName: FontStyleNames, newValue: unknown, beforeValue?: unknown): TextSegment[] {
    textStyle = cloneDeep(textStyle);

    textStyle.forEach((style) => {
        if (beforeValue === undefined || (beforeValue !== undefined && isEqual(style[styleName], beforeValue))) {
            //@ts-expect-error -- dynamic access
            style[styleName] = newValue;
        }
    });

    return textStyle;
}

/*comparing character styles to the styles of the composing substring*/
function isEqualLetterStyle(letter: TextSegment, textStyle: TextSegment): boolean {
    let is = true;

    // iterating over font properties
    for (const key in letter) {
        if (key !== 'characters') {
            // @ts-expect-error -- dynamic access
            if (!isEqual(letter[key], textStyle[key])) {
                // property varies
                // stop searching
                is = false;
                break;
            }
        }
    }

    return is;
}

export {
    parseTextStyle,
    splitTextStyleIntoLines,
    joinTextLinesStyles,
    applyTextStyleToTextNode,
    changeCharactersTextStyle,
    changeTextStyle,
};
