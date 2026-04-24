const assert = require('assert');

describe('Dropzone', () => {
    before(async () => {
        await gf.navigate('http://localhost:54321/tests/');
        // Seems that the page has been loaded but the injected scripts are not.
        // Because of that we need wait them with the following hack
        await gf.retryIfFails(async () => {
            await gf.executeScript(() => createAsyncSpec);
        });
        await gf.executeScript(() => {
            window.createDropzoneElement = (hasChild = false, index) => {
                const container = document.createElement('DIV');

                container.style.width = '100px';
                container.style.height = '100px';
                container.classList.add('dropzone');

                if (hasChild) {
                    container.innerHTML = `<div class="square square-${index}" style="background-color: cadetblue; width: 100px; height: 100px;">${index}</div>`;
                }

                return container;
            };

            window.createDropzones = async () => {
                const zones = [true, false, true, false, true];

                zones.forEach((zone, index) => {
                    document.body.appendChild(createDropzoneElement(zone, index));
                });

                await createAsyncSpec();
            };

            window.removeDropzones = () => {
                const dropzones = document.querySelectorAll('.dropzone');

                dropzones.forEach(dropzone => document.body.removeChild(dropzone));
            };
        });
    });

    beforeEach(async () => {
        await gf.executeScript(async () => {
            await createDropzones();
        });
    });

    afterEach(async () => {
        await gf.executeScript(() => {
            removeDropzones();
        });
    });

    it('Should create dropzone object', async () => {
        const square = await gf.executeScript(() => {
            return new interactionManager.dropzone({ element: '.square', dropzones: ['.dropzone'] });
        });
        assert.equal(typeof square, 'object');
        assert.notEqual(square.draggableElements, null);
        assert.notEqual(square.dropzones, null);
    });

    it('Should get correct HTML element', async () => {
        const areElementsEqual = await gf.executeScript(() => {
            const selector = '.square';

            const square = new interactionManager.dropzone({ element: '.square', dropzones: ['.dropzone'] });
            const squareElement = document.querySelector(selector);
            return square.draggableElements[0] === squareElement;
        });

        assert(areElementsEqual);
    });

    it('Should drag element to dropzone', async () => {
        await gf.executeScript(() => new interactionManager.dropzone({ element: '.square', dropzones: ['.dropzone'] }));
        const draggableEl = await gf.get('.square');
        const dropzones = await gf.getAll('.dropzone');
        const { x: dropzoneLeft, y: dropzoneTop } = await dropzones[1].getPositionOnScreen();

        // +50 because we want to place the square in the center of the dropzone
        await draggableEl.drag(dropzoneLeft + 50, dropzoneTop + 50);
        const isPositionCorrect = await draggableEl.waitForPositionOnScreen({ x: dropzoneLeft, y: dropzoneTop });
        assert(isPositionCorrect);
    });

    it('Should add to dropzone if droptype is add', async () => {
        await gf.executeScript(() => new interactionManager.dropzone({ element: '.square', dropzones: ['.dropzone'], dropType: 'add' }));

        const draggableEl = await gf.get('.square');
        const dropzones = await gf.getAll('.dropzone');
        const { x: dropzoneLeft, y: dropzoneTop } = await dropzones[2].getPositionOnScreen();

        // +50 because we want to place the square in the center of the dropzone
        await draggableEl.drag(dropzoneLeft + 50, dropzoneTop + 50);
        assert((await (await dropzones[2]).children()).length, 2);
    });

    it('Should not move element if droptype is none', async () => {
        await gf.executeScript(() => new interactionManager.dropzone({ element: '.square', dropzones: ['.dropzone'], dropType: 'none' }));

        const draggableEl = await gf.get('.square');
        const { x: initialX, y: initialY } = await draggableEl.getPositionOnScreen();
        const dropzones = await gf.getAll('.dropzone');
        const { x: dropzoneLeft, y: dropzoneTop } = await dropzones[2].getPositionOnScreen();

        // +50 because we want to place the square in the center of the dropzone
        await draggableEl.drag(dropzoneLeft + 50, dropzoneTop + 50);
        const isPositionCorrect = await draggableEl.waitForPositionOnScreen({ x: initialX, y: initialY });
        assert(isPositionCorrect);
    });

    it('Should switch elements if droptype is switch', async () => {
        await gf.executeScript(() => new interactionManager.dropzone({ element: '.square', dropzones: ['.dropzone'], dropType: 'switch' }));

        const square1 = await gf.get('.square-0');
        const square2 = await gf.get('.square-2');
        const { x: initialX, y: initialY } = await square1.getPositionOnScreen();
        const dropzones = await gf.getAll('.dropzone');
        const { x: dropzoneLeft, y: dropzoneTop } = await dropzones[2].getPositionOnScreen();

        // +50 because we want to place the square in the center of the dropzone
        await square1.drag(dropzoneLeft + 50, dropzoneTop + 50);

        assert(await square1.waitForPositionOnScreen({ x: dropzoneLeft, y: dropzoneTop }))
        assert(await square2.waitForPositionOnScreen({ x: initialX, y: initialY }))
    });

    it('Should shift element to the nearest empty space if droptype is shift', async () => {
        await gf.executeScript(() => new interactionManager.dropzone({ element: '.square', dropzones: ['.dropzone'], dropType: 'shift' }));

        const square1 = await gf.get('.square-0');
        const square2 = await gf.get('.square-2');
        // const { x: initialX, y: initialY } = await square1.getPositionOnScreen();
        const dropzones = await gf.getAll('.dropzone');
        const dropzone = dropzones.nth(2);
        const dropzoneNext = dropzones.nth(1);
        const { x: dropzoneLeft, y: dropzoneTop } = await dropzone.getPositionOnScreen();
        const { x: dropzoneNextLeft, y: dropzoneNextTop } = await dropzoneNext.getPositionOnScreen();

        // +50 because we want to place the square in the center of the dropzone
        await square1.drag(dropzoneLeft + 50, dropzoneTop + 50);

        assert(await square1.waitForPositionOnScreen({ x: dropzoneLeft, y: dropzoneTop }))
        assert(await square2.waitForPositionOnScreen({ x: dropzoneNextLeft, y: dropzoneNextTop }))
    });

    for (const method of ['onDragStart', 'onDragMove', 'onDragEnd']) {
        it(`Should trigger ${method} callback`, async () => {
            await gf.executeScript((method) => {
                window.hasPassed = false;
                new interactionManager.dropzone({
                    element: '.square',
                    dropzones: ['.dropzone'],
                    [method]: () => {
                        window.hasPassed = true;
                    },
                });
            }, method);

            const draggableEl = await gf.get('.square');
            const dropzones = await gf.getAll('.dropzone');
            const { x: dropzoneLeft, y: dropzoneTop } = await dropzones[1].getPositionOnScreen();

            // +50 because we want to place the square in the center of the dropzone
            await draggableEl.drag(dropzoneLeft + 50, dropzoneTop + 50);
            assert.equal(await gf.executeScript(() => hasPassed), true);
        });
    }
});
