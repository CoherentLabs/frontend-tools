const assert = require('assert');

/**
 * Opens the test page and registers `window.setupTestPage`, which renders 6 squares in a 3x2 grid:
 * 1 2 3
 * 4 5 6
 */
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

/**
 * Asserts that the element matching the selector is focused. Retries until it is or the retry times out.
 * @param {string} selector
 */
async function isElementFocused(selector) {
    const targetEl = await gf.get(selector);
    await gf.retryIfFails(async () => {
        assert(await targetEl.isFocused());
    });
}

/**
 * Renders two 3x2 grids side by side and initializes spatial navigation with one area per grid:
 * area-1: 1  2  3  |  area-2: 7  8  9
 *         4  5  6  |          10 11 12
 */
async function setupAreas() {
    await gf.executeScript(async () => {
        const square = i => `<div class="square square-${i}">${i}</div>`;
        const grid = (area, from) => `<div class="square-container ${area}" style="width: 307px; margin-right: 50px; display: flex; flex-wrap: wrap;">
                ${Array.from({ length: 6 }, (_, i) => square(from + i)).join('\n')}
            </div>`;

        const el = document.createElement('div');
        el.className = 'test-container';
        el.style.cssText = 'display: flex;';
        el.innerHTML = grid('area-1', 1) + grid('area-2', 7);

        cleanTestPage('.test-container');
        document.body.appendChild(el);

        await new Promise((resolve) => {
            waitForStyles(resolve);
        });

        interactionManager.spatialNavigation.init([
            { area: 'area-1', elements: ['.area-1 .square'] },
            { area: 'area-2', elements: ['.area-2 .square'] },
        ]);
    });
}

/**
 * Removes the grids and deinitializes spatial navigation (which also clears the onNavigationEdge callback).
 */
async function teardownAreas() {
    await gf.executeScript(() => {
        cleanTestPage('.test-container');
        interactionManager.spatialNavigation.deinit();
    });
}

/**
 * Adds the `disabled` attribute to the squares with the given numbers.
 * @param {...number} ids
 */
async function disableSquares(...ids) {
    await gf.executeScript((ids) => {
        ids.forEach(id => document.querySelector(`.square-${id}`).setAttribute('disabled', ''));
    }, ids);
}

/**
 * Focuses the square with the given number and waits until it is focused.
 * @param {number} id
 */
async function focusSquare(id) {
    await gf.executeScript((id) => document.querySelector(`.square-${id}`).focus(), id);
    await isElementFocused(`.square-${id}`);
}

/**
 * Sets an onNavigationEdge callback that switches to the other area when moving left/right past the edge,
 * instead of looping. Up/down still loop.
 */
async function setupAreaCycling() {
    await gf.executeScript(() => {
        const sn = interactionManager.spatialNavigation;
        const nextArea = { 'area-1': 'area-2', 'area-2': 'area-1' };

        sn.onNavigationEdge = ({ direction, area }) => {
            if (direction !== 'left' && direction !== 'right') return;

            sn.switchArea(nextArea[area], { direction });
            return false;
        };
    });
}

/**
 * Calls spatialNavigation.switchArea in the page.
 * @param {string} area
 * @param {Object} [options] - switchArea options
 * @returns {Promise<string|null>} The number of the focused square as text, or null if nothing was focused
 */
async function switchArea(area, options) {
    return gf.executeScript((area, options) => {
        const element = interactionManager.spatialNavigation.switchArea(area, options);
        return element ? element.textContent : null;
    }, area, options);
}

module.exports = {
    setup,
    isElementFocused,
    setupAreas,
    teardownAreas,
    disableSquares,
    focusSquare,
    setupAreaCycling,
    switchArea,
};
