/**
 * Maps CSS shorthand properties to the longhands they expand into.
 *
 * Used in two ways:
 *   1. The shorthand probe sets a canonical value and reads back each longhand
 *      from getComputedStyle to detect partial-shorthand support.
 *   2. The reconciler uses this map to label partial entries correctly.
 *
 * Longhands listed here are the ones the spec requires the shorthand to
 * populate. Any longhand that stays empty after setting the shorthand
 * indicates the shorthand is only partially supported.
 */
export const SHORTHAND_MAP: Record<string, { longhands: string[]; testValue: string }> = {
    // Box model
    margin: {
        longhands: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
        testValue: '10px 20px 30px 40px',
    },
    padding: {
        longhands: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
        testValue: '10px 20px 30px 40px',
    },
    inset: {
        longhands: ['top', 'right', 'bottom', 'left'],
        testValue: '10px 20px 30px 40px',
    },

    // Border
    border: {
        longhands: [
            'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
            'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
            'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        ],
        testValue: '2px solid red',
    },
    'border-top': {
        longhands: ['border-top-width', 'border-top-style', 'border-top-color'],
        testValue: '2px solid red',
    },
    'border-right': {
        longhands: ['border-right-width', 'border-right-style', 'border-right-color'],
        testValue: '2px solid red',
    },
    'border-bottom': {
        longhands: ['border-bottom-width', 'border-bottom-style', 'border-bottom-color'],
        testValue: '2px solid red',
    },
    'border-left': {
        longhands: ['border-left-width', 'border-left-style', 'border-left-color'],
        testValue: '2px solid red',
    },
    'border-width': {
        longhands: ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
        testValue: '1px 2px 3px 4px',
    },
    'border-style': {
        longhands: ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'],
        testValue: 'solid dashed dotted double',
    },
    'border-color': {
        longhands: ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
        testValue: 'red green blue yellow',
    },
    'border-radius': {
        longhands: [
            'border-top-left-radius', 'border-top-right-radius',
            'border-bottom-right-radius', 'border-bottom-left-radius',
        ],
        testValue: '5px 10px 15px 20px',
    },
    'border-image': {
        longhands: [
            'border-image-source', 'border-image-slice',
            'border-image-width', 'border-image-outset', 'border-image-repeat',
        ],
        testValue: 'none 1 / 1 / 0 stretch',
    },

    // Background
    background: {
        longhands: [
            'background-color', 'background-image', 'background-repeat',
            'background-position', 'background-size', 'background-attachment',
            'background-origin', 'background-clip',
        ],
        testValue: 'red none repeat 0% 0% auto scroll padding-box border-box',
    },
    'background-position': {
        longhands: ['background-position-x', 'background-position-y'],
        testValue: '10px 20px',
    },

    // Font & text
    font: {
        longhands: [
            'font-style', 'font-variant', 'font-weight',
            'font-size', 'line-height', 'font-family',
        ],
        testValue: 'italic small-caps bold 16px/1.5 Arial',
    },
    'text-decoration': {
        longhands: ['text-decoration-line', 'text-decoration-style', 'text-decoration-color'],
        testValue: 'underline solid red',
    },
    'text-emphasis': {
        longhands: ['text-emphasis-style', 'text-emphasis-color'],
        testValue: 'filled red',
    },

    // Outline
    outline: {
        longhands: ['outline-width', 'outline-style', 'outline-color'],
        testValue: '2px solid blue',
    },

    // List
    'list-style': {
        longhands: ['list-style-type', 'list-style-position', 'list-style-image'],
        testValue: 'disc inside none',
    },

    // Columns
    columns: {
        longhands: ['column-count', 'column-width'],
        testValue: '3 100px',
    },
    'column-rule': {
        longhands: ['column-rule-width', 'column-rule-style', 'column-rule-color'],
        testValue: '2px solid black',
    },

    // Flexbox
    flex: {
        longhands: ['flex-grow', 'flex-shrink', 'flex-basis'],
        testValue: '1 1 auto',
    },
    'flex-flow': {
        longhands: ['flex-direction', 'flex-wrap'],
        testValue: 'row wrap',
    },

    // Grid
    'grid-template': {
        longhands: ['grid-template-rows', 'grid-template-columns', 'grid-template-areas'],
        testValue: 'none / none',
    },
    'grid-area': {
        longhands: ['grid-row-start', 'grid-column-start', 'grid-row-end', 'grid-column-end'],
        testValue: '1 / 1 / 2 / 2',
    },
    'grid-row': {
        longhands: ['grid-row-start', 'grid-row-end'],
        testValue: '1 / 2',
    },
    'grid-column': {
        longhands: ['grid-column-start', 'grid-column-end'],
        testValue: '1 / 2',
    },
    'grid-gap': {
        longhands: ['row-gap', 'column-gap'],
        testValue: '10px 20px',
    },
    gap: {
        longhands: ['row-gap', 'column-gap'],
        testValue: '10px 20px',
    },

    // Animation & transition
    animation: {
        longhands: [
            'animation-name', 'animation-duration', 'animation-timing-function',
            'animation-delay', 'animation-iteration-count',
            'animation-direction', 'animation-fill-mode', 'animation-play-state',
        ],
        testValue: 'none 0s ease 0s 1 normal none running',
    },
    transition: {
        longhands: [
            'transition-property', 'transition-duration',
            'transition-timing-function', 'transition-delay',
        ],
        testValue: 'all 0s ease 0s',
    },

    // Overflow
    overflow: {
        longhands: ['overflow-x', 'overflow-y'],
        testValue: 'hidden scroll',
    },

    // Place items (CSS Grid/Flex alignment)
    'place-items': {
        longhands: ['align-items', 'justify-items'],
        testValue: 'center start',
    },
    'place-content': {
        longhands: ['align-content', 'justify-content'],
        testValue: 'center start',
    },
    'place-self': {
        longhands: ['align-self', 'justify-self'],
        testValue: 'center start',
    },

    // Mask
    mask: {
        longhands: [
            'mask-image', 'mask-mode', 'mask-repeat',
            'mask-position', 'mask-clip', 'mask-origin', 'mask-size', 'mask-composite',
        ],
        testValue: 'none add',
    },
};
