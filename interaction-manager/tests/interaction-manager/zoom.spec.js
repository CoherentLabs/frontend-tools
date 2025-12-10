const assert = require('assert');

const simulateZoom = async (x, y, direction) => {
    await gf.mouseWheel(x, y, 0, direction * -1);
};

describe('Pan and Zoom', () => {
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

    it('Should create panzoom object', async () => {
        const zoom = await gf.executeScript(async () => new interactionManager.zoom({ element: '.square' }));

        assert.equal(typeof zoom, 'object');
        assert.notEqual(zoom.zoomableElement, null);
    });

    it('Should get correct element', async () => {
        const areElementsEqual = await gf.executeScript(async () => {
            const selector = '.square';
            const zoom = new interactionManager.zoom({ element: selector });
            const zoomElement = document.querySelector(selector);
            return zoom.zoomableElement === zoomElement;
        });

        assert(areElementsEqual);
    });

    it('Should zoom in correctly', async () => {
        await gf.executeScript(async () => new interactionManager.zoom({ element: '.square' }));
        const element = await gf.get('.square');

        await simulateZoom(100, 100, 1);

        assert(await element.waitForStyles({ transform: 'matrix3d(1.100, 0.000, 0.000, 0.000, 0.000, 1.100, 0.000, 0.000, 0.000, 0.000, 1.000, 0.000, -10.000, -10.000, 0.000, 1.000)' }));
    });

    it('Should zoom out correctly', async () => {
        await gf.executeScript(async () => new interactionManager.zoom({ element: '.square' }));
        const element = await gf.get('.square');
        await simulateZoom(100, 100, -1);

        assert(await element.waitForStyles({ transform: 'matrix3d(0.900, 0.000, 0.000, 0.000, 0.000, 0.900, 0.000, 0.000, 0.000, 0.000, 1.000, 0.000, 10.000, 10.000, 0.000, 1.000)' }));
    });

    it('Should pan correctly', async () => {
        await gf.executeScript(async () => new interactionManager.zoom({ element: '.square' }));
        const element = await gf.get('.square');
        const offset = 100;

        const { x: initialLeft, y: initialTop } = await element.getPositionOnScreen();

        await simulateZoom(initialLeft + offset, initialTop + offset, 1);

        assert(await element.waitForPositionOnScreen({ x: initialLeft - offset * 0.1, y: initialTop - offset * 0.1 }));
    });

    it('Should not zoom out less than the min zoom', async () => {
        let scale = 1;
        const minZoom = 0.3;
        await gf.executeScript(async (minZoom) => new interactionManager.zoom({ element: '.square', minZoom }), minZoom);

        while (scale >= minZoom - 0.1) {
            await simulateZoom(100, 100, -1);
            scale -= 0.1;
        }

        const element = await gf.get('.square');
        assert(await element.waitForStyles({ transform: 'matrix3d(0.300, 0.000, 0.000, 0.000, 0.000, 0.300, 0.000, 0.000, 0.000, 0.000, 1.000, 0.000, 70.000, 70.000, 0.000, 1.000)' }));
    });

    it('Should not zoom in more than the max zoom', async () => {
        let scale = 1;
        const maxZoom = 2;
        await gf.executeScript(async (maxZoom) => new interactionManager.zoom({ element: '.square', maxZoom }), maxZoom);

        while (scale <= maxZoom + 0.5) {
            await simulateZoom(100, 100, 1);
            scale += 0.1;
        }

        const element = await gf.get('.square');
        assert(await element.waitForStyles({ transform: 'matrix3d(2.000, 0.000, 0.000, 0.000, 0.000, 2.000, 0.000, 0.000, 0.000, 0.000, 1.000, 0.000, -100.000, -100.000, 0.000, 1.000)' }));
    });

    it('Should zoom according to the zoom factor', async () => {
        const zoomFactor = 1;
        await gf.executeScript(async (zoomFactor) => new interactionManager.zoom({ element: '.square', zoomFactor }), zoomFactor);

        await simulateZoom(100, 100, 1);

        const element = await gf.get('.square');
        assert(await element.waitForStyles({ transform: 'matrix3d(2.000, 0.000, 0.000, 0.000, 0.000, 2.000, 0.000, 0.000, 0.000, 0.000, 1.000, 0.000, -100.000, -100.000, 0.000, 1.000)' }));
    });

    it('Should trigger onZoom callback', async () => {
        await gf.executeScript(async () => {
            window.hasPassed = false;
            new interactionManager.zoom({
                element: '.square',
                onZoom: () => {
                    window.hasPassed = true;
                },
            });
        });

        await simulateZoom(100, 100, 1);
        const hasPassed = await gf.executeScript(async () => window.hasPassed);
        assert(hasPassed);
    });
});
