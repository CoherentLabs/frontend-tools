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
            const square = i => `<div class="square square-${i}">${i}</div>`;

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
            const defaultArea = interactionManager.spatialNavigation.areas.default;
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

describe('Spatial navigation - Isolated State and Syncing', () => {
    before(setup);

    beforeEach(async () => {
        await gf.executeScript(async () => {
            await window.setupTestPage();
            // Setup two distinct areas
            interactionManager.spatialNavigation.init([
                { area: 'area-1', elements: ['.square-1', '.square-2'] },
                { area: 'area-2', elements: ['.square-4', '.square-5'] },
            ]);
        });
    });

    afterEach(async () => {
        await gf.executeScript(() => {
            cleanTestPage('.test-container');
            interactionManager.spatialNavigation.deinit();
        });
    });

    it('Should keep area states isolated', async () => {
        const hasIsolation = await gf.executeScript(() => {
            const sn = interactionManager.spatialNavigation;
            // Focus something in Area 1
            sn.focusFirst('area-1');
            const area1Last = sn.getLastFocused('area-1');
            const area2Last = sn.getLastFocused('area-2');

            // Area 2 should NOT have a lastFocusedElement just because Area 1 does
            return area1Last !== undefined && area2Last === undefined;
        });

        assert(hasIsolation, 'State leaked between area-1 and area-2');
    });

    it('Should sync lastFocusedElement when focusing with the mouse', async () => {
        // Manually click square-5 (which is in area-2)
        const square5 = await gf.get('.square-5');
        await square5.click();

        // Verify internal state synced via 'focusin' event
        const syncedCorrectly = await gf.executeScript(() => {
            const sn = interactionManager.spatialNavigation;
            const lastFocusedInArea2 = sn.getLastFocused('area-2');
            return lastFocusedInArea2 && lastFocusedInArea2.classList.contains('square-5');
        });

        assert(syncedCorrectly, 'Internal state did not sync with mouse click');

        // Move left via keyboard - it should move from square-5 to square-4
        await gf.keyPress(gf.KEYS.ARROW_LEFT);
        await isElementFocused('.square-4');
    });

    it('Should fallback to focusFirst if lastFocusedElement was removed from DOM', async () => {
        // Focus square-2
        await gf.executeScript(() => {
            interactionManager.spatialNavigation.focusFirst('area-1');
        });
        await gf.keyPress(gf.KEYS.ARROW_RIGHT);
        await isElementFocused('.square-2');

        // Remove square-2 from the DOM
        await gf.executeScript(() => {
            const sq2 = document.querySelector('.square-2');
            sq2.remove();
        });

        // Switch area back to area-1. 
        // It should detect sq2 is gone and fallback to square-1 (focusFirst)
        await gf.executeScript(() => {
            interactionManager.spatialNavigation.switchArea('area-1');
        });

        await isElementFocused('.square-1');
    });

    it('Should remember the last mouse-clicked position when switching back to an area', async () => {
        // 1. Focus Area 1 via keyboard
        await gf.executeScript(() => interactionManager.spatialNavigation.focusFirst('area-1'));
        
        // 2. Click Square 5 in Area 2 with mouse
        const square5 = await gf.get('.square-5');
        await square5.click();

        // 3. Switch to Area 1 then back to Area 2
        await gf.executeScript(() => {
            const sn = interactionManager.spatialNavigation;
            sn.switchArea('area-1'); // focus square-1
            sn.switchArea('area-2'); // should focus square-5, not square-4
        });

        await isElementFocused('.square-5');
    });
});

describe('Spatial navigation - Overflowing Containers and Edge Wrapping', () => {
    before(setup);

    beforeEach(async () => {
        await gf.executeScript(async () => {
            // Create 20 items, each 50px tall. Total height = 1000px
            const item = i => `<div class="square list-item item-${i}" style="flex-shrink: 0;">Item ${i}</div>`;

            const el = document.createElement('div');
            el.className = 'test-container overflow-container';
            // Restrict container height to 200px to force scrolling
            el.style.cssText = 'height: 200px; width: 300px; overflow-y: scroll; display: flex; flex-direction: column;';
            el.innerHTML = Array.from({ length: 20 }, (_, i) => item(i + 1)).join('\n');

            cleanTestPage('.test-container');
            document.body.appendChild(el);

            await new Promise((resolve) => {
                waitForStyles(resolve);
            });

            interactionManager.spatialNavigation.init([
                { area: 'long-list', elements: ['.list-item'] },
            ]);
        });
    });

    afterEach(async () => {
        await gf.executeScript(() => {
            cleanTestPage('.test-container');
            interactionManager.spatialNavigation.deinit();
        });
    });

    it('Should wrap to the last item when navigating UP from the first item', async () => {
        // Start by explicitly focusing the first item
        await gf.executeScript(() => {
            interactionManager.spatialNavigation.focusFirst('long-list');
        });
        await isElementFocused('.item-1');

        // Trigger wrap-around UP
        await gf.keyPress(gf.KEYS.ARROW_UP);

        // Assert it found the item with the highest Y coordinate
        await isElementFocused('.item-20');
    });

    it('Should wrap to the first item when navigating DOWN from the last item', async () => {
        // Start by explicitly focusing the last item
        await gf.executeScript(() => {
            interactionManager.spatialNavigation.focusLast('long-list');
            
            // Force the container to scroll to the very bottom to push the top items off-screen.
            // This replicates the negative Y coordinate bug scenario.
            const container = document.querySelector('.overflow-container');
            container.scrollTop = container.scrollHeight;
        });
        await isElementFocused('.item-20');

        // Trigger wrap-around DOWN
        await gf.keyPress(gf.KEYS.ARROW_DOWN);

        // Assert it found the item with the lowest Y coordinate
        await isElementFocused('.item-1');
    });
});