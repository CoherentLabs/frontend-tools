const assert = require('assert');

describe('Menu', function () {
    it('Should navigate to the menu page', async () => {
        // Replace with your html file path that you want to test. The path should be absolute or relative to the passed gameface path.
        await gf.navigate('../../../frontend-tools/e2e/examples/menu/menu.html');
    });

    it('Page 1 should be active', async () => {
        assert((await gf.getClasses('#link-1')).includes('active'));
        assert((await gf.getClasses('#page-1')).includes('active'));
        assert.equal(await gf.text('.page.active .title'), 'Page 1');
        assert.equal(await gf.text('.page.active .content'), 'This is the content of page 1.');
    });

    it('Page 2 should be inactive', async () => {
        assert(!(await gf.getClasses('#link-2')).includes('active'));
        assert(!(await gf.getClasses('#page-2')).includes('active'));
    });

    it('Should navigate to page 2', async () => {
        const link = (await gf.get('#link-2'));
        await link.click();

        assert((await link.classes()).includes('active'));
        assert((await gf.getClasses('#page-2')).includes('active'));
        assert.equal((await gf.text('.page.active .title')), 'Page 2');
        assert.equal((await gf.text('.page.active .content')), 'This is the content of page 2.');
    });

    it('Should navigate back to page 1', async () => {
        const link = (await gf.get('#link-1'));
        await link.click();

        assert((await link.classes()).includes('active'));
        assert((await gf.getClasses('#page-1')).includes('active'));
        assert.equal((await gf.text('.page.active .title')), 'Page 1');
        assert.equal((await gf.text('.page.active .content')), 'This is the content of page 1.');
    });
});