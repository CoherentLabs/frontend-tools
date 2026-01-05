const assert = require('assert');

async function setup() {
    await gf.navigate('http://localhost:54321/tests/');
    // Seems that the page has been loaded but the injected scripts are not.
    // Because of that we need wait them with the following hack
    await gf.retryIfFails(async () => {
        await gf.executeScript(() => cleanTestPage);
    })
    await gf.executeScript(() => {
        window.setupTestPage = async () => {
            const square = i => `<div class="square square-${i}" style="width: 100px; height: 100px; background-color: burlywood; box-sizing: border-box; margin:1px;">${i}</div>`;

            const el = document.createElement('div');
            el.className = 'test-container';
            el.innerHTML = `<div class="square-container" style="width: 307px; display: flex; flex-wrap: wrap;">
                    ${Array.from({ length: 6 }, (_, i) => square(i + 1)).join('\n')}
                </div>`;

            cleanTestPage('.test-container');

            document.body.appendChild(el);

            return new Promise((resolve) => {
                waitForStyles(resolve);
            });
        }
    });
}

async function isElementFocused(selector) {
    const targetEl = await gf.get(selector);
    await gf.retryIfFails(async () => {
        assert(await targetEl.isFocused());
    });
}

describe('Spatial navigation', () => {
    before(setup);

    beforeEach(async () => {
        await gf.executeScript(async () => {
            await window.setupTestPage();
            interactionManager.spatialNavigation.init([
                { area: 'squares', elements: ['.square'] },
            ]);
            interactionManager.spatialNavigation.focusFirst('squares');
        });
    });

    afterEach(async () => {
        await gf.executeScript(() => {
            cleanTestPage('.test-container');
            interactionManager.spatialNavigation.deinit();
        });
    });

    it('Should add new navigation keys', async () => {
        await gf.executeScript(() => interactionManager.spatialNavigation.changeKeys({ up: 'W', down: 'S', left: 'A', right: 'D' }));

        const keys = ['D', 'D', 'S', 'A', 'A', 'W', 'D'];
        // right, right, down, left, left, up, right => position 2
        for (const key of keys) {
            await gf.keyPress(key);
        }

        await isElementFocused('.square-2');
    });

    it('Should add new keys without overwriting the old ones', async () => {
        await gf.executeScript(() => {
            interactionManager.spatialNavigation.changeKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
            interactionManager.spatialNavigation.changeKeys({ up: 'I', down: 'K', left: 'J', right: 'L' });
        });

        const keys = ['L', 'L', 'K', 'J', 'J', 'I', 'L'];
        // right, right, down, left, left, up, right => position 2
        for (const key of keys) {
            await gf.keyPress(key);
        }

        await isElementFocused('.square-2');
    });

    it('Should reset keys', async () => {
        await gf.executeScript(() => {
            interactionManager.spatialNavigation.changeKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
            interactionManager.spatialNavigation.resetKeys();
        });

        const keys = [gf.KEYS.ARROW_RIGHT, gf.KEYS.ARROW_RIGHT, gf.KEYS.ARROW_DOWN, gf.KEYS.ARROW_LEFT, gf.KEYS.ARROW_LEFT, gf.KEYS.ARROW_UP, gf.KEYS.ARROW_RIGHT];
        for (const key of keys) {
            await gf.keyPress(key);
        }

        await isElementFocused('.square-2');
    });

    it('Should clear all custom keys and reinitiate the default ones', async () => {
        await gf.executeScript(() => {
            interactionManager.spatialNavigation.changeKeys({ down: 'S' }, { clearCurrentActiveKeys: true });
        });

        const keys = ['S', 'S', gf.KEYS.ARROW_RIGHT, 'S', gf.KEYS.ARROW_UP];
        for (const key of keys) {
            await gf.keyPress(key);
        }

        await isElementFocused('.square-4');
    });

    it('Should continue movement from last focused item after losing focus on the area', async () => {
        await gf.keyPress(gf.KEYS.ARROW_RIGHT);

        await gf.executeScript(() => {
            document.activeElement.blur();
        });

        await gf.keyPress(gf.KEYS.ARROW_LEFT);

        await isElementFocused('.square-1');
    });

});

describe('Spatial navigation - HTMLElement support', () => {
    before(setup);

    beforeEach(async () => {
        await gf.executeScript(async () => {
            await setupTestPage();
        });
    });

    afterEach(async () => {
        await gf.executeScript(() => {
            cleanTestPage('.test-container');
            interactionManager.spatialNavigation.deinit();
        });
    });

    it('Should add an array of HTMLElements to the default area', async () => {
        const elements = ['.square-1', '.square-2', '.square-3'];

        await gf.executeScript(async () => {
            const elements = [
                document.querySelector('.square-1'),
                document.querySelector('.square-2'),
                document.querySelector('.square-3'),
            ];

            interactionManager.spatialNavigation.init(elements);
            interactionManager.spatialNavigation.focusFirst();
        });


        for (const el of elements) {
            await isElementFocused(el);
            await gf.keyPress(gf.KEYS.ARROW_RIGHT);
        }
    });

    it('Should support HTMLElement refs in object syntax', async () => {
        const elements = ['.square-1', '.square-2'];

        await gf.executeScript(async () => {
            const element1 = document.querySelector('.square-1');
            const element2 = document.querySelector('.square-2');

            interactionManager.spatialNavigation.init([
                { area: 'custom', elements: [element1, element2] },
            ]);
            interactionManager.spatialNavigation.focusFirst('custom');
        });

        for (const el of elements) {
            await isElementFocused(el);
            await gf.keyPress(gf.KEYS.ARROW_RIGHT);
        }
    });

    it('Should support mixed arrays of selectors and HTMLElement refs', async () => {
        const elements = ['.square-1', '.square-2', '.square-3'];

        await gf.executeScript(async () => {
            const elementRef = document.querySelector('.square-2');

            interactionManager.spatialNavigation.init([
                { area: 'mixed', elements: ['.square-1', elementRef, '.square-3'] },
            ]);
            interactionManager.spatialNavigation.focusFirst('mixed');
        });

        for (const el of elements) {
            await isElementFocused(el);
            await gf.keyPress(gf.KEYS.ARROW_RIGHT);
        }
    });

    it('Should make HTMLElement refs focusable', async () => {
        await gf.executeScript(async () => {
            const element = document.querySelector('.square-1');
            interactionManager.spatialNavigation.init([element]);
        });

        assert(await (await gf.get('.square-1')).waitForAttributes({ tabindex: '1' }));
    });

    it('Should allow adding HTMLElements to existing areas', async () => {
        const hasPassed = await gf.executeScript(async () => {
            const element1 = document.querySelector('.square-1');
            const element2 = document.querySelector('.square-2');
            interactionManager.spatialNavigation.init([element1]);
            interactionManager.spatialNavigation.add([element2]);
            const defaultArea = interactionManager.spatialNavigation.navigatableElements.default;
            return defaultArea.elements.length === 2 && defaultArea.elements[0] === element1 && defaultArea.elements[1] === element2;
        });

        assert(hasPassed);
    });
});

describe('Spatial navigation - Pause/Resume functionality', () => {
    before(setup);

    beforeEach(async () => {
        await gf.executeScript(async () => {
            await window.setupTestPage();
            interactionManager.spatialNavigation.init([
                { area: 'squares', elements: ['.square'] },
            ]);
            interactionManager.spatialNavigation.focusFirst('squares');
        });
    });

    afterEach(async () => {
        await gf.executeScript(() => {
            cleanTestPage('.test-container');
            interactionManager.spatialNavigation.deinit();
        });
    });

    it('Should not move focus when paused', async () => {
        await isElementFocused('.square-1');

        await gf.executeScript(() => interactionManager.spatialNavigation.pause());

        await gf.keyPress(gf.KEYS.ARROW_RIGHT);
        await isElementFocused('.square-1');

        await gf.keyPress(gf.KEYS.ARROW_DOWN);
        await isElementFocused('.square-1');
    });

    it('Should resume navigation after calling resume()', async () => {
        await gf.executeScript(() => interactionManager.spatialNavigation.pause());

        await gf.keyPress(gf.KEYS.ARROW_RIGHT);
        await isElementFocused('.square-1');

        await gf.executeScript(() => interactionManager.spatialNavigation.resume());

        await gf.keyPress(gf.KEYS.ARROW_RIGHT);
        await isElementFocused('.square-2');
    });

    it('Should handle multiple pause/resume cycles correctly', async () => {
        await isElementFocused('.square-1');

        await gf.executeScript(() => interactionManager.spatialNavigation.pause());
        await gf.keyPress(gf.KEYS.ARROW_RIGHT);
        await isElementFocused('.square-1');

        await gf.executeScript(() => interactionManager.spatialNavigation.resume());
        await gf.keyPress(gf.KEYS.ARROW_RIGHT);
        await isElementFocused('.square-2');

        await gf.executeScript(() => interactionManager.spatialNavigation.pause());
        await gf.keyPress(gf.KEYS.ARROW_RIGHT);
        await isElementFocused('.square-2');

        await gf.executeScript(() => interactionManager.spatialNavigation.resume());
        await gf.keyPress(gf.KEYS.ARROW_RIGHT);
        await isElementFocused('.square-3');
    });
});