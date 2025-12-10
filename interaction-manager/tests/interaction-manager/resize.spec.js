const assert = require('assert');

describe('Resize', () => {
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
        await gf.executeScript(() => {
            cleanTestPage('.square');
            cleanTestPage('.container');
        })
    });

    it('Should create resize object', async () => {
        const square = await gf.executeScript(() => new interactionManager.resize({ element: '.square' }));

        assert(square);
        assert.notEqual(square, null);
    });

    it('Should get correct HTML element', async () => {
        const areElementsEqual = await gf.executeScript(() => {
            const selector = '.square';

            const square = new interactionManager.resize({ element: selector });
            const squareElement = document.querySelector(selector);
            return square.resizableElement === squareElement;
        });

        assert(areElementsEqual);
    });

    it('Should create correct borders', async () => {
        await gf.executeScript(() => new interactionManager.resize({ element: '.square' }));

        const square = await gf.get('.square');
        for (const borderSelector of ['[data-edge="bottom"]', '[data-edge="right"]', '[data-edge="bottomRight"]']) {
            assert(await square.find(borderSelector));
        }
    });

    it('Should change width', async () => {
        await gf.executeScript(() => new interactionManager.resize({ element: '.square' }));
        const square = await gf.get('.square');
        const rightEdge = await square.find('[data-edge="right"]');

        const { x } = await square.getPositionOnScreen();
        const targetWidth = 300;
        const movement = x + targetWidth;
        await rightEdge.drag(movement, 0);

        const hasCorrectSize = await square.waitForSize({ width: targetWidth });
        assert(hasCorrectSize);
    });

    it('Should change height', async () => {
        await gf.executeScript(() => new interactionManager.resize({ element: '.square' }));
        const square = await gf.get('.square');
        const bottomEdge = await square.find('[data-edge="bottom"]');

        const { y } = await square.getPositionOnScreen();
        const targetHeight = 300;
        const movement = y + targetHeight;
        await bottomEdge.drag(0, movement);

        const hasCorrectSize = await square.waitForSize({ height: targetHeight });
        assert(hasCorrectSize);
    });

    it('Should change height and width', async () => {
        await gf.executeScript(() => new interactionManager.resize({ element: '.square' }));
        const square = await gf.get('.square');
        const bottomRightEdge = await square.find('[data-edge="bottomRight"]');

        const { x, y } = await square.getPositionOnScreen();
        const target = 300;
        const movementX = x + target;
        const movementY = y + target;
        await bottomRightEdge.drag(movementX, movementY);

        const hasCorrectSize = await square.waitForSize({ width: target, height: target });
        assert(hasCorrectSize);
    });

    it('Width action should change width', async () => {
        const targetWidth = 300;

        await gf.executeScript((targetWidth) => {
            const square = new interactionManager.resize({ element: '.square' });

            interactionManager.actions.execute(square.widthAction, targetWidth);
        }, targetWidth);

        const square = await gf.get('.square');
        const hasCorrectSize = await square.waitForSize({ width: targetWidth });
        assert(hasCorrectSize);
    });

    it('Height action should change height', async () => {
        const targetHeight = 300;

        await gf.executeScript((targetHeight) => {
            const square = new interactionManager.resize({ element: '.square' });

            interactionManager.actions.execute(square.heightAction, targetHeight);
        }, targetHeight);

        const square = await gf.get('.square');
        const hasCorrectSize = await square.waitForSize({ height: targetHeight });
        assert(hasCorrectSize);
    });

    it('Should trigger onWidthChange', async () => {
        await gf.executeScript(() => {
            window.hasPassed = false;

            new interactionManager.resize({
                element: '.square',
                onWidthChange: () => {
                    window.hasPassed = true;
                },
            });
        });

        const square = await gf.get('.square');
        const rightEdge = await square.find('[data-edge="right"]');

        const { x } = await square.getPositionOnScreen();
        const targetWidth = 300;
        const movement = x + targetWidth;
        await rightEdge.drag(movement, 0);
        assert.equal(await gf.executeScript(() => window.hasPassed), true);
    });

    it('Should trigger onHeightChange', async () => {
        await gf.executeScript(() => {
            window.hasPassed = false;

            new interactionManager.resize({
                element: '.square',
                onHeightChange: () => {
                    window.hasPassed = true;
                },
            });
        });

        const square = await gf.get('.square');
        const bottomEdge = await square.find('[data-edge="bottom"]');

        const { y } = await square.getPositionOnScreen();
        const targetHeight = 300;
        const movement = y + targetHeight;
        await bottomEdge.drag(0, movement);
        assert.equal(await gf.executeScript(() => window.hasPassed), true);
    });
});
