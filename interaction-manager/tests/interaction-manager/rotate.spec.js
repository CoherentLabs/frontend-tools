const assert = require('assert');

/**
 * @param {DOMElement} square
 * @param {number} x
 * @param {number} y
 */
const rotateElement = async (square, x, y) => {
    const { x: left, y: top } = await square.getPositionOnScreen();
    const { width } = await square.getSize();

    await gf.mousePress(left + width / 2, top);
    await gf.mouseMove(left + width / 2 + x, top + y);
    await gf.mouseRelease();
};

describe('Rotate', () => {
    before(async () => {
        await gf.navigate('http://localhost:54321/tests/');
        // Seems that the page has been loaded but the injected scripts are not.
        // Because of that we need wait them with the following hack
        await gf.retryIfFails(async () => {
            await gf.executeScript(() => createIMElement)
        })
    });

    beforeEach(async () => {
        await gf.executeScript(async () => await createIMElement());
    });

    afterEach(async () => {
        await gf.executeScript(() => cleanTestPage('.container'))
    });

    it('Should create rotate object', async () => {
        const square = await gf.executeScript(async () => new interactionManager.rotate({ element: '.square' }));

        assert.equal(typeof square, 'object');
        assert(square.rotatingElement !== null);
        assert(square.rotateElement !== null);
    });

    it('Should get correct element', async () => {
        const selector = '.square';
        const areElementsEqual = await gf.executeScript(async (selector) => {
            const square = new interactionManager.rotate({ element: selector })
            const squareElement = document.querySelector(selector);
            return square.rotatingElement === squareElement;
        }, selector);

        assert(areElementsEqual);
    });

    it('Should rotate element', async () => {
        await gf.executeScript(async () => new interactionManager.rotate({ element: '.square' }));
        const square = await gf.get('.square');

        const moveX = 100;
        const moveY = 100;

        await rotateElement(square, moveX, moveY);
        const hasRotated = await square.waitForStyles({ transform: 'rotateZ(90deg)' });
        assert(hasRotated);
    });

    it('Action should rotate element correctly', async () => {
        await gf.executeScript(async () => {
            const square = new interactionManager.rotate({ element: '.square' });
            const targetAngle = 45;

            interactionManager.actions.execute(square.actionName, targetAngle);
        });
        const square = await gf.get('.square');
        const hasRotated = await square.waitForStyles({ transform: 'rotateZ(45deg)' });
        assert(hasRotated);
    });

    it('Should correctly snap to angle', async () => {
        const snapAngle = 45;
        await gf.executeScript(async (snapAngle) => new interactionManager.rotate({ element: '.square', snapAngle }), snapAngle);
        const square = await gf.get('.square');

        const moveX = 60;
        const moveY = 60;

        await rotateElement(square, moveX, moveY);
        const hasRotated = await square.waitForStyles({ transform: 'rotateZ(45deg)' });
        assert(hasRotated);
    });

    it('Should trigger onRotation callback', async () => {
        await gf.executeScript(async () => {
            window.hasPassed = false;

            new interactionManager.rotate({
                element: '.square',
                onRotation: () => {
                    window.hasPassed = true;
                },
            });
        });

        const square = await gf.get('.square');

        const moveX = 100;
        const moveY = 100;

        await rotateElement(square, moveX, moveY);
        assert.equal(await gf.executeScript(() => window.hasPassed), true)
    });
});
