const assert = require('assert');

describe('Draggable', () => {
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

    it('Should create draggable object', async () => {
        const square = await gf.executeScript(() => {
            return new interactionManager.draggable({ element: '.square' });
        });

        assert.equal(typeof square, 'object');
        assert(square.draggableElements !== null);
    });

    it('Should get correct HTML element', async () => {
        const areElementsEqual = await gf.executeScript(() => {
            const selector = '.square';

            const square = new interactionManager.draggable({ element: selector });
            const squareElement = document.querySelector(selector);
            return square.draggableElements[0] === squareElement;
        });

        assert(areElementsEqual);
    });

    it('Should drag element on screen', async () => {
        const movement = 200;
        await gf.executeScript(() => new interactionManager.draggable({ element: '.square' }));

        const draggableEl = await gf.get('.square');
        await draggableEl.drag(movement, movement);
        // -100 because drag method is dragging the element from the center
        const isPositionCorrect = await draggableEl.waitForPositionOnScreen({ x: movement - 100, y: movement - 100 });
        assert(isPositionCorrect);
    });

    it('Action should move the element on screen', async () => {
        const movement = 200;
        await gf.executeScript((movement) => {
            const square = new interactionManager.draggable({ element: '.square' });
            const squareElement = square.draggableElements[0];

            squareElement.style.position = 'absolute';
            interactionManager.actions.execute(square.actionName, { x: movement, y: movement, index: 0 });
        }, movement);

        const draggableEl = await gf.get('.square');
        const isPositionCorrect = await draggableEl.waitForPositionOnScreen({ x: movement, y: movement });
        assert(isPositionCorrect);
    });

    it('Should lock element in x axis when dragging', async () => {
        const movement = 200;
        await gf.executeScript(() => new interactionManager.draggable({ element: '.square', lockAxis: 'x' }));

        const draggableEl = await gf.get('.square');
        await draggableEl.drag(movement, movement);
        // -100 because drag method is dragging the element from the center
        const isPositionCorrect = await draggableEl.waitForPositionOnScreen({ x: movement - 100, y: 0 });
        assert(isPositionCorrect);
    });

    it('Should lock element in y axis when dragging', async () => {
        const movement = 200;
        await gf.executeScript(() => new interactionManager.draggable({ element: '.square', lockAxis: 'y' }));

        const draggableEl = await gf.get('.square');
        await draggableEl.drag(movement, movement);
        // -100 because drag method is dragging the element from the center
        const isPositionCorrect = await draggableEl.waitForPositionOnScreen({ x: 0, y: movement - 100 });
        assert(isPositionCorrect);
    });

    it('Should not go out of parent bounds when dragging', async () => {
        await gf.executeScript(() => new interactionManager.draggable({ element: '.square', restrictTo: '.container' }));
        const draggableEl = await gf.get('.square');
        const parent = await draggableEl.getParent();
        const { width, height } = await parent.getSize();

        await draggableEl.drag(width + 200, height + 200);
        const { x, y } = await draggableEl.getPositionOnScreen();
        assert(x < width, `Expected element x: ${x} to be less than parent width: ${width}`);
        assert(y < height, `Expected element y: ${y} to be less than parent height: ${height}`);
    });

    for (const method of ['onDragStart', 'onDragMove', 'onDragEnd']) {
        it(`Should trigger ${method} callback`, async () => {
            const movement = 200;

            await gf.executeScript((method) => {
                window.hasPassed = false;
                new interactionManager.draggable({
                    element: '.square',
                    [method]: () => {
                        window.hasPassed = true;
                    },
                });
            }, method);

            const draggableEl = await gf.get('.square');
            await draggableEl.drag(movement, movement);

            assert.equal(await gf.executeScript(() => hasPassed), true)
        });
    }
});
