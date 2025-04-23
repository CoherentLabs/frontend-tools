const assert = require('assert');

describe('Test script', function () {
    it('Should navigate to the test page', async () => {
        // Replace with your html file path that you want to test. The path should be absolute or relative to the passed gameface path.
        await gf.navigate('../../../frontend-tools/e2e/examples/index.html');
    });

    it('Should get element', async () => {
        assert((await gf.get('#container')));
    });

    it('Should get text content', async () => {
        assert.equal((await gf.text('#container')).trim(), 'Test content');

        const el = await gf.get('#container');
        assert.equal((await el.text()).trim(), 'Test content');
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

    it('Should test element with children', async () => {
        const el = (await gf.get('#element-with-children'));
        const children = await el.children();
        assert.equal(children.length, 2);
        assert.equal((await gf.getAll('.child')).length, 2);

        assert.equal((await children.first().text()), '123');
        assert.equal((await children.last().text()), '456');
        assert.equal((await children.nth(1).text()), '456');
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
        styles = await el.styles();
        for (const [prop, value] of Object.entries(expectedStyles)) {
            assert.equal(styles[prop], value, `Expected ${prop} to be ${value}`);
        }
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

    it('Should test if element is scrollable', async () => {
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
        assert.deepEqual(await el.getPositionOnScreen(), { x: -200, y: 0 });
    });

    it('Should get size of element', async () => {
        let el = (await gf.get(`#non-visible-element`));
        assert.deepEqual(await el.getSize(), { height: 100, width: 100 });
    });

    it('Should get attributes of element', async () => {
        let el = (await gf.get(`#non-focusable-element`));
        const expectedAttributes = {
            'tabindex': '1',
            'disabled': '',
        };

        const attributes = await el.getAttributes();
        for (const [prop, value] of Object.entries(expectedAttributes)) {
            assert.equal(attributes[prop], value, `Expected ${prop} to be ${value}`);
        }
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
});