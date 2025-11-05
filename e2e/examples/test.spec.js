const assert = require('assert');

const PORT = process.env.PORT || 54321;

describe('Test script', function () {
    it('Should navigate to the test page', async () => {
        // Replace with your html file path that you want to test. The path should be absolute or relative to the passed gameface path.
        await gf.navigate(`http://localhost:${PORT}`);
    });

    it('Should get element', async () => {
        assert((await gf.get('#container')));
    });

    it('Should get text content', async () => {
        assert.equal((await gf.text('#container')).trim(), 'Test content');

        const el = await gf.get('#container');
        assert.equal((await el.text()).trim(), 'Test content');
        assert(await el.waitForText('Test content'));
    });

    it('Should check if element contains element with text', async () => {
        const el = (await gf.get('#element-with-text'));
        assert((await el.contains('123')));
        assert((await gf.contains('123', '#element-with-text')));
    });

    it('Should test element with children', async () => {
        const el = (await gf.get('#element-with-children'));
        const children = await el.children();
        assert.equal(children.length, 2);
        assert.equal((await gf.getAll('.child')).length, 2);

        assert.equal((await children.first().text()).trim(), '123');
        assert.equal((await children.last().text()).trim(), '456');
        assert.equal((await children.nth(1).text()).trim(), '456');
    });

    it('Should test getting an element\'s parent', async () => {
        const el = (await gf.get('#element-with-children'));
        const children = await el.children();

        const firstChild = children[0];
        const parent = await firstChild.getParent();

        assert.equal(parent.nodeId, el.nodeId);
    });

    it('Should test finding an element', async () => {
        const el = (await gf.get('#find-element'));
        const childElement = await el.find('.text');
        assert(childElement);
        assert(await childElement.text(), 'Text');
    });

    it('Should test finding all elements', async () => {
        const el = (await gf.get('#element-with-children'));
        const childElements = await el.findAll('.child');
        assert.equal(childElements.length, 2);
        assert.equal(await childElements.first().text(), '123');
    });

    it('Should test getting styles of an element', async () => {
        const expectedStyles = {
            'background-color': 'rgba(255, 0, 0, 1)',
            'width': '100px',
            'height': '100px',
        };

        let styles = await gf.getStyles('#element-with-styles');
        for (const [prop, value] of Object.entries(expectedStyles)) {
            assert.equal(styles[prop], value, `Expected ${prop} to be ${value}`);
        }

        const el = (await gf.get('#element-with-styles'));
        assert(await el.waitForStyles(expectedStyles));
    });

    it('Should test if element is hidden', async () => {
        const hiddenElements = await gf.getAll('.hidden-element');

        for (let i = 0; i < hiddenElements.length; i++) {
            assert.equal(await gf.isHidden(`#hidden-element-${i + 1}`), true);
            assert.equal(await hiddenElements.nth(i).isHidden(), true);
        }
    });

    it('Should test if element is visible', async () => {
        assert.equal(await gf.isVisible(`#non-visible-element`), false);
        assert.equal(await gf.isVisible(`#visible-element`), true);

        let el = (await gf.get(`#non-visible-element`));
        assert.equal(await el.isVisible(), false);
        el = (await gf.get(`#scrollable-element`));
        assert.equal(await el.isVisible(), true);
    });

    it('Should test if element is visible', async () => {
        const assertElement = await gf.get('#wait-for-visiblity-assert-element');
        await gf.click('#wait-for-visibility-false');
        assert(await assertElement.waitForVisibility(false));
        assert.equal(await assertElement.isVisible(), false)
        await gf.click('#wait-for-visibility-true');
        assert(await assertElement.waitForVisibility(true));
    });

    it('Should scroll to bottom', async () => {
        await gf.scrollToTop();
        const assertElement = await gf.get('#wait-for-visiblity-assert-element');
        const document = await gf.get('html');
        assert(await assertElement.waitForVisibilityInScrollableArea(document, false));

        await gf.scrollToBottom();
        assert(await assertElement.waitForVisibilityInScrollableArea(document, true));
        await gf.scrollToTop();
    });

    it('Should test if element is scrollable', async () => {
        await gf.scrollTo(0, 0);

        assert.equal(await gf.isScrollable(`#non-scrollable-element`), false);
        assert.equal(await gf.isScrollable(`#scrollable-element`), true);

        let el = (await gf.get(`#non-scrollable-element`));
        assert.equal(await el.isScrollable(), false);
        el = (await gf.get(`#scrollable-element`));
        assert.equal(await el.isScrollable(), true);
    });

    it('Should test if element is focusable', async () => {
        // Using the gf object only
        assert.equal(await gf.isFocusable(`#non-focusable-element`), false);
        assert.equal(await gf.isFocusable(`#focusable-element`), true);

        // Using the gf object + DOMelement object
        let el = (await gf.get(`#non-focusable-element`));
        assert.equal(await el.isFocusable(), false);
        el = (await gf.get(`#focusable-element`));
        assert.equal(await el.isFocusable(), true);
    });

    it('Should get position on the screen of element', async () => {
        let el = (await gf.get(`#non-visible-element`));
        assert(await el.waitForPositionOnScreen({ x: -200, y: 0 }));
    });

    it('Should get size of element', async () => {
        let el = (await gf.get(`#non-visible-element`));
        assert.deepEqual(await el.getSize(), { height: 100, width: 100 });
        assert(await el.waitForSize({ height: 100, width: 100 }));
    });

    it('Should get attributes of element', async () => {
        let el = (await gf.get(`#non-focusable-element`));
        const expectedAttributes = {
            'tabindex': '1',
            'disabled': '',
        };

        assert(await el.waitForAttributes(expectedAttributes));
    });

    it('Should get attribute of element', async () => {
        let el = (await gf.get(`#non-focusable-element`));

        assert.equal(await el.getAttribute('tabindex'), '1');
        assert.equal(await el.getAttribute('data-test'), undefined);
    });

    it('Should get if element has attribute', async () => {
        let el = (await gf.get(`#non-focusable-element`));

        assert(await el.hasAttribute('tabindex'));
        assert(!await el.hasAttribute('data-test'));
    });

    it('Should set attribute of element', async () => {
        let el = (await gf.get(`#non-focusable-element`));

        assert(!await el.hasAttribute('data-test'));
        await el.setAttribute('data-test', '1');
        assert(await el.hasAttribute('data-test'));
        assert.equal(await el.getAttribute('data-test'), '1');
    });

    it('Should click on an element and check the border color when focused with the click event', async () => {
        let el = (await gf.get(`#focusable-element`));
        let styles = await el.styles();

        for (const position of ['right', 'top', 'bottom', 'left']) {
            assert.equal(styles[`border-${position}-color`], 'initial');
        }

        await el.click();

        styles = await el.styles();

        for (const position of ['right', 'top', 'bottom', 'left']) {
            assert.equal(styles[`border-${position}-color`], 'rgba(0, 0, 255, 1)');
        }
    });

    it('Should hover on an element and check background color', async () => {
        let el = (await gf.get(`#test-hover`));
        let styles = await el.styles();

        assert.equal(styles['background-color'], 'rgba(255, 255, 255, 1)');

        await el.hover();
        styles = await el.styles();

        assert.equal(styles['background-color'], 'rgba(0, 0, 0, 1)');
    });

    it('Should drag and drop an element', async () => {
        const el = (await gf.get(`#draggable`));
        const { x, y } = await el.getPositionOnScreen();
        assert.equal(x, 200);
        assert.equal(y, 200);
        await el.drag(500, 500);
        // Should be 450, 450 because the element is 100x100 and the drag is 500, 500. Mouse is at the center of the element.
        assert(await el.waitForPositionOnScreen({ x: 450, y: 450 }));
    });
});

describe('Test custom scripts', function () {
    it('Should navigate to the test page', async () => {
        // Replace with your html file path that you want to test. The path should be absolute or relative to the passed gameface path.
        await gf.navigate(`http://localhost:${PORT}`);
    });

    it('Should execute custom javascript', async () => {
        await gf.executeScript(() => {
            // @ts-ignore
            document.body.style = 'background: red;';
        });

        assert.equal((await (await gf.get(`body`)).styles())['background-color'], 'rgba(255, 0, 0, 1)');
    });

    it('Should execute custom javascript with a promise', async () => {
        await gf.executeScript(async () => {
            const promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    // @ts-ignore
                    document.body.style = 'background: blue;';
                    resolve();
                }, 500);
            });

            await promise;
        });

        assert.equal((await (await gf.get(`body`)).styles())['background-color'], 'rgba(0, 0, 255, 1)');
    });

    it('Should execute custom javascript and get value', async () => {
        assert.equal(await gf.executeScript(() => document.getElementById('container').textContent.trim()), 'Test content')
    });

    it('Should execute custom javascript with an error', async () => {
        try {
            await gf.executeScript(() => {
                throw new Error('test 1');
            });
        } catch (error) {
            assert.match(error.message, /Error: test 1/)
        }
    });
});

describe('Test scroll', function () {
    it('Should navigate to the test page', async () => {
        // Replace with your html file path that you want to test. The path should be absolute or relative to the passed gameface path.
        await gf.navigate(`http://localhost:${PORT}`);
    });

    it('Should not scroll a non scrollable element', async () => {
        const el = (await gf.get(`#draggable`));
        try {
            await el.scroll(10);
        } catch (error) {
            assert.equal(error.message, 'Trying to scroll node that is not scrollable!')
        }
    });

    it('Should scroll element to another element', async () => {
        const scrollableArea = (await gf.get(`#scrollable-container`));
        const el = await gf.get(`#inner-scrollable-element`);
        assert.equal(await el.isVisibleInScrollableArea(scrollableArea), false);
        await gf.retryIfFails(async () => {
            await scrollableArea.scroll(0, 50);
            assert.equal(await el.isVisibleInScrollableArea(scrollableArea), true);
        })
    });

    it('Should scroll to top and then element into view', async () => {
        const scrollableArea = (await gf.get(`#scrollable-container`));
        await scrollableArea.scrollTo(0, 0);
        const el = await gf.get(`#inner-scrollable-element`);
        assert.equal(await el.isVisibleInScrollableArea(scrollableArea), false);
        await el.scrollIntoView(scrollableArea);
        assert.equal(await el.isVisibleInScrollableArea(scrollableArea), true);
    });

    it('Should scroll to top and then element into view without passing the scrollable area', async () => {
        const scrollableArea = (await gf.get(`#scrollable-container`));
        await scrollableArea.scrollTo(0, 0);
        const el = await gf.get(`#inner-scrollable-element`);
        assert.equal(await el.isVisibleInScrollableArea(scrollableArea), false);
        await el.scrollIntoView();
        assert.equal(await el.isVisibleInScrollableArea(scrollableArea), true);
    });

});

describe('Test click events', function () {
    const keys = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
    it('Should navigate to the test page', async () => {
        // Replace with your html file path that you want to test. The path should be absolute or relative to the passed gameface path.
        await gf.navigate(`http://localhost:${PORT}`);
    });

    for (let key of keys) {
        it(`Should click on an element with ${key} pressed`, async () => {
            const el = (await gf.get(`#click-test-element`));
            await el.click({ [key]: true });
            assert.equal(await el.text(), `Test click with ${key} pressed`);
        });
    }

    for (let key of keys) {
        it(`Should right click on an element with ${key} pressed`, async () => {
            const el = (await gf.get(`#click-test-element`));
            await el.rightClick({ [key]: true });
            assert.equal(await el.text(), `Test right click with ${key} pressed`);
        });
    }

    for (let key of keys) {
        it(`Should double click on an element with ${key} pressed`, async () => {
            const el = (await gf.get(`#dblclick-test-element`));
            await el.doubleClick({ [key]: true });
            assert.equal(await el.text(), `Test dblclick with ${key} pressed`);
        });
    }
});

describe('Test key events', function () {
    const typeMessage = 'Test message';
    const keys = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
    it('Should navigate to the test page', async () => {
        // Replace with your html file path that you want to test. The path should be absolute or relative to the passed gameface path.
        await gf.navigate(`http://localhost:${PORT}`);
    });

    for (let key of keys) {
        it(`Should type "${typeMessage}" to element with ${key} pressed`, async () => {
            const el = (await gf.get(`#input-area`));
            for (let i = 0; i < typeMessage.length; i++) {
                await el.keyDown(typeMessage[i], { [key]: true });
            }
            assert.equal(await el.text(), `Test message`);
            await el.keyDown(gf.KEYS.BACKSPACE, void 0, typeMessage.length);
            assert.equal(await el.text(), ``);
        });
    }

    for (let key of keys) {
        it(`Should type "${typeMessage}" to input with ${key} pressed`, async () => {
            const el = (await gf.get(`#input-element`));
            await el.type(typeMessage, { [key]: true });
            assert.equal(await el.getValue(), `Test message`);
            await el.clear();
            assert(await el.waitForValue(``));
        });
    }
});

describe('Test document key events', function () {
    const typeMessage = 'Test message';
    const keys = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
    it('Should navigate to the test page', async () => {
        // Replace with your html file path that you want to test. The path should be absolute or relative to the passed gameface path.
        await gf.navigate(`http://localhost:${PORT}/document-events.html`);
    });

    for (let key of keys) {
        it(`Should keydown "${typeMessage}" to document with ${key} pressed`, async () => {
            for (let i = 0; i < typeMessage.length; i++) {
                await gf.keyDown(typeMessage[i], { [key]: true });
            }
            const el = (await gf.get(`#test-element`));
            assert.equal(await el.text(), `Test message`);
            await gf.keyDown(gf.KEYS.BACKSPACE, void 0, typeMessage.length);
            assert.equal(await el.text(), ``);
        });
    }

    for (let key of keys) {
        it(`Should keyup "${typeMessage}" to document with ${key} pressed`, async () => {
            for (let i = 0; i < typeMessage.length; i++) {
                await gf.keyUp(typeMessage[i], { [key]: true });
            }
            const el = (await gf.get(`#test-element-2`));
            assert.equal(await el.text(), `Test message`);
            await gf.keyUp(gf.KEYS.BACKSPACE, void 0, typeMessage.length);
            assert.equal(await el.text(), ``);
        });
    }
});

describe('Test mouse events', function () {
    it('Should navigate to the test page', async () => {
        // Replace with your html file path that you want to test. The path should be absolute or relative to the passed gameface path.
        await gf.navigate(`http://localhost:${PORT}/document-events.html`);
    });

    it(`Should mousedown to document`, async () => {
        await gf.mousePress();
        const el = (await gf.get(`#test-mouse`));
        assert.equal(await el.text(), `Mouse down`);
    });

    it(`Should mouseup to document`, async () => {
        await gf.mouseRelease();
        const el = (await gf.get(`#test-mouse`));
        assert.equal(await el.text(), `Mouse up`);
    });

    it(`Should mousemove to coordinates`, async () => {
        await gf.mouseMove(100, 150);
        const el = (await gf.get(`#test-mouse`));
        assert.equal(await el.text(), `100, 150`);
    });
});

describe('Test custom events', function () {
    it('Should navigate to the test page', async () => {
        // Replace with your html file path that you want to test. The path should be absolute or relative to the passed gameface path.
        await gf.navigate(`http://localhost:${PORT}`);
    });

    it(`Should dispatch custom event to document`, async () => {
        await gf.trigger('custom-event-test', { value: 'test-document' });
        assert.equal(await gf.text(`#custom-event-element`), `test-document`);
    });

    it(`Should dispatch custom event to element`, async () => {
        const el = (await gf.get(`#custom-event-element`));
        await el.trigger('custom-event-test', { value: 'test' })
        assert.equal(await el.text(), `test`);
    });
});

describe('Test data-binding', function () {
    const Model = { value: 'test', arr: [{ value: 1, class: 'one' }, { value: 2, class: 'two' }, { value: 3, class: 'three' }] };

    this.beforeAll('Should navigate to the test page', async () => {
        // Replace with your html file path that you want to test. The path should be absolute or relative to the passed gameface path.
        await gf.navigate(`http://localhost:${PORT}/data-binding.html`);

        await gf.createModel('Model', Model);
    });

    it(`Should create model and check the element bounded value`, async () => {
        assert.equal(await gf.text(`#test-element`), `test`);
        const items = await gf.getAll('.item');
        items.forEach(async (item, index) => {
            assert.equal(await item.text(), index);
        })
    });

    it(`Should update model and check the element bounded value`, async () => {
        await gf.updateModel('Model', () => {
            Model.value = 'test2';
            Model.arr[1].value = 1234;
        });
        assert.equal(await gf.text(`#test-element`), `test2`);
        assert.equal(await (await gf.getAll(`.item`)).nth(1).text(), 1234);
    });

    it(`Should trigger engine event`, async () => {
        // Add the test engine event here to ensure the engine object is properly set up in the HTML page, 
        // as the cohtml.js script is not directly imported inside the data-binding.html page.
        await gf.executeBindingScript(() => {
            // @ts-ignore
            engine.on('test-event', (data) => {
                document.querySelector('#test-engine-event').textContent = data.value;
            })
        });

        await gf.triggerEngineEvent('test-event', { value: 'test-data' });
        assert.equal(await gf.text(`#test-engine-event`), `test-data`);
    });

    it(`Should listen for engine event triggered from the UI`, async () => {
        const eventData = await gf.onEngineEvent('test-engine-event', async () => {
            await gf.click('#trigger-engine-event');
        });

        assert.deepEqual(eventData, { value: 'test-engine-value' });
    });
});