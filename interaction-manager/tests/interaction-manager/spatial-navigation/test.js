/* globals simulateKeyPress */
/* eslint-disable new-cap */
/* eslint-disable max-lines-per-function */
const createTemplate = (squares = 6) => {
    const square = i => `<div class="square square-${i}" style="width: 100px; height: 100px; background-color: burlywood; box-sizing: border-box; border:1px solid black;">${i}</div>`;

    return `<div class="square-container" style="width: 305px; display: flex; flex-wrap: wrap;">
       ${Array.from({ length: squares }, (_, i) => square(i + 1)).join('\n')}
    </div>`;
};

let expectedActiveEl = '';

/**
 * @param {string} template
 * @returns {Promise<void>}
 */
async function setupTestPage(template) {
    const el = document.createElement('div');
    el.className = 'test-container';
    el.innerHTML = template;

    cleanTestPage('.test-container');

    document.body.appendChild(el);

    return new Promise((resolve) => {
        waitForStyles(resolve);
    });
}

describe('Spatial navigation', () => {
    beforeEach(async () => {
        await setupTestPage(createTemplate());
        interactionManager.spatialNavigation.init([
            { area: 'squares', elements: ['.square'] },
        ]);
        interactionManager.spatialNavigation.focusFirst('squares');
        expectedActiveEl = document.querySelector('.square-1');
    });

    afterEach(() => {
        cleanTestPage('.test-container');
        interactionManager.spatialNavigation.deinit();
    });

    it('Should add new navigation keys', () => {
        interactionManager.spatialNavigation.changeKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });

        // right, right, down, left, left, up => position 1
        ['D', 'D', 'S', 'A', 'A', 'W'].forEach((key) => {
            simulateKeyPress(key.toUpperCase());
        });
        assert.strictEqual(document.activeElement, expectedActiveEl, `Expected the active element to be '.square-1' after navigating with custom keys, but found '${document.activeElement.className}' instead.`);
    });

    it('Should add new keys without overwriting the old ones', () => {
        interactionManager.spatialNavigation.changeKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
        interactionManager.spatialNavigation.changeKeys({ up: 'I', down: 'K', left: 'J', right: 'L' });

        // right, right, down, left, left, up => position 1
        ['L', 'L', 'K', 'J', 'J', 'I'].forEach((key) => {
            simulateKeyPress(key.toUpperCase());
        });
        assert.strictEqual(document.activeElement, expectedActiveEl, `Expected the active element to be '.square-1' after navigating with custom keys, but found '${document.activeElement.className}' instead.`);
    });

    it('Should clear all custom keys and reinitiate the default ones', () => {
        interactionManager.spatialNavigation.changeKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
        interactionManager.spatialNavigation.resetKeys();

        ['arrow_right', 'arrow_right', 'arrow_down', 'arrow_left', 'arrow_left', 'arrow_up'].forEach((key) => {
            simulateKeyPress(key.toUpperCase());
        });
        assert.strictEqual(document.activeElement, expectedActiveEl, `Expected the active element to be '.square-1' after navigating with custom keys, but found '${document.activeElement.className}' instead.`);
    });

    it('Should clear all custom keys and reinitiate the default ones', () => {
        interactionManager.spatialNavigation.changeKeys({ down: 'S' }, { clearCurrentActiveKeys: true });

        ['S', 'S', 'arrow_up', 'arrow_right'].forEach((key) => {
            simulateKeyPress(key.toUpperCase());
        });
        assert.strictEqual(document.activeElement, expectedActiveEl, `Expected the active element to be '.square-1' after navigating with custom keys, but found '${document.activeElement.className}' instead.`);
    });

    it('Should continue movement from last focused item after losing focus on the area', () => {
        simulateKeyPress('ARROW_RIGHT');
        document.activeElement.blur();
        simulateKeyPress('ARROW_LEFT');

        assert.strictEqual(document.activeElement, expectedActiveEl, `Expected the active element to be '.square-1' but found '${document.activeElement.className}' instead.`);
    });
});

describe('Spatial navigation - HTMLElement support', () => {
    afterEach(() => {
        cleanTestPage('.test-container');
        interactionManager.spatialNavigation.deinit();
    });

    beforeEach(async () => {
        await setupTestPage(createTemplate());
    });

    it('Should add an array of HTMLElements to the default area', () => {
        const elements = [
            document.querySelector('.square-1'),
            document.querySelector('.square-2'),
            document.querySelector('.square-3'),
        ];

        interactionManager.spatialNavigation.init(elements);
        interactionManager.spatialNavigation.focusFirst();

        elements.forEach((el) => {
            assert.strictEqual(document.activeElement, el, `Expected ${el} to be focused`);
            simulateKeyPress('ARROW_RIGHT');
        });
    });

    it('Should support HTMLElement refs in object syntax', () => {
        const element1 = document.querySelector('.square-1');
        const element2 = document.querySelector('.square-2');

        interactionManager.spatialNavigation.init([
            { area: 'custom', elements: [element1, element2] },
        ]);
        interactionManager.spatialNavigation.focusFirst('custom');

        assert.strictEqual(document.activeElement, element1, 'Expected the first element to be focused');

        simulateKeyPress('ARROW_RIGHT');
        assert.strictEqual(document.activeElement, element2, 'Expected navigation to second element');
    });

    it('Should support mixed arrays of selectors and HTMLElement refs', () => {
        const elementRef = document.querySelector('.square-2');

        interactionManager.spatialNavigation.init([
            { area: 'mixed', elements: ['.square-1', elementRef, '.square-3'] },
        ]);
        interactionManager.spatialNavigation.focusFirst('mixed');

        const expectedElements = [
            document.querySelector('.square-1'),
            elementRef,
            document.querySelector('.square-3'),
        ];

        expectedElements.forEach((el) => {
            assert.strictEqual(document.activeElement, el, `Expected ${el} to be focused`);
            simulateKeyPress('ARROW_RIGHT');
        });
    });

    it('Should make HTMLElement refs focusable', () => {
        const element = document.querySelector('.square-1');
        interactionManager.spatialNavigation.init([element]);
        assert.strictEqual(element.getAttribute('tabindex'), '1', 'Expected HTMLElement ref to have tabindex set');
    });

    it('Should allow adding HTMLElements to existing areas', () => {
        const element1 = document.querySelector('.square-1');
        const element2 = document.querySelector('.square-2');

        interactionManager.spatialNavigation.init([element1]);
        interactionManager.spatialNavigation.add([element2]);

        const defaultArea = interactionManager.spatialNavigation.navigatableElements.default;

        assert.strictEqual(defaultArea.elements.length, 2, 'Expected default area to have 2 elements');
        assert.strictEqual(defaultArea.elements[0], element1, 'Expected first element in area');
        assert.strictEqual(defaultArea.elements[1], element2, 'Expected second element in area');
    });
});

describe('Spatial navigation - Pause/Resume functionality', () => {
    beforeEach(async () => {
        await setupTestPage(createTemplate());
        interactionManager.spatialNavigation.init([
            { area: 'squares', elements: ['.square'] },
        ]);
        interactionManager.spatialNavigation.focusFirst('squares');
    });

    afterEach(() => {
        cleanTestPage('.test-container');
        interactionManager.spatialNavigation.deinit();
    });

    it('Should not move focus when paused', () => {
        const initialElement = document.querySelector('.square-1');
        assert.strictEqual(document.activeElement, initialElement, 'Expected to start at square-1');

        interactionManager.spatialNavigation.pause();

        simulateKeyPress('ARROW_RIGHT');
        assert.strictEqual(document.activeElement, initialElement, 'Expected focus to remain on square-1 after pressing right while paused');

        simulateKeyPress('ARROW_DOWN');
        assert.strictEqual(document.activeElement, initialElement, 'Expected focus to remain on square-1 after pressing down while paused');
    });

    it('Should resume navigation after calling resume()', () => {
        const initialElement = document.querySelector('.square-1');
        const expectedElement = document.querySelector('.square-2');

        interactionManager.spatialNavigation.pause();
        simulateKeyPress('ARROW_RIGHT');
        assert.strictEqual(document.activeElement, initialElement, 'Expected focus to remain on square-1 while paused');

        interactionManager.spatialNavigation.resume();
        simulateKeyPress('ARROW_RIGHT');
        assert.strictEqual(document.activeElement, expectedElement, 'Expected focus to move to square-2 after resuming');
    });

    it('Should handle multiple pause/resume cycles correctly', () => {
        const square1 = document.querySelector('.square-1');
        const square2 = document.querySelector('.square-2');
        const square3 = document.querySelector('.square-3');

        assert.strictEqual(document.activeElement, square1, 'Expected to start at square-1');

        interactionManager.spatialNavigation.pause();
        simulateKeyPress('ARROW_RIGHT');
        assert.strictEqual(document.activeElement, square1, 'Expected to stay at square-1 (first pause)');

        interactionManager.spatialNavigation.resume();
        simulateKeyPress('ARROW_RIGHT');
        assert.strictEqual(document.activeElement, square2, 'Expected to move to square-2 (first resume)');

        interactionManager.spatialNavigation.pause();
        simulateKeyPress('ARROW_RIGHT');
        assert.strictEqual(document.activeElement, square2, 'Expected to stay at square-2 (second pause)');

        interactionManager.spatialNavigation.resume();
        simulateKeyPress('ARROW_RIGHT');
        assert.strictEqual(document.activeElement, square3, 'Expected to move to square-3 (second resume)');
    });
});
