const assert = require('assert');

const PORT = process.env.PORT || 54321;
const GAMEPAD_ID = 'test-buttons'
describe('Test gamepad buttons and axes', function () {
    it('Should navigate to the test page', async () => {
        await gf.navigate(`http://localhost:${PORT}/gamepad/gamepad-buttons-and-axes.html`);
        await gf.connectGamepad(GAMEPAD_ID);
    });

    it(`Should run sequence`, async () => {
        await gf.executeScript((down, left, up) => {
            //@ts-ignore
            window.onDown = () => { document.getElementById('sequence-test').style.background = 'rgb(100, 100, 100)'; }
            //@ts-ignore
            window.onLeft = () => { document.getElementById('sequence-test').style.transform = 'scale(1.1)'; }
            //@ts-ignore
            window.onUp = () => { document.getElementById('sequence-test').textContent = 'Sequence tested!'; }
            //@ts-ignore
            gamepad.on({ actions: [down], callback: window.onDown });
            //@ts-ignore
            gamepad.on({ actions: [left], callback: window.onLeft });
            //@ts-ignore
            gamepad.on({ actions: [up], callback: window.onUp });
        }, gf.GAMEPAD_BUTTONS.PAD_DOWN, gf.GAMEPAD_BUTTONS.PAD_LEFT, gf.GAMEPAD_BUTTONS.PAD_UP);
        const gamepad = gf.getGamepad(GAMEPAD_ID);
        await gamepad.sequence([
            gf.GAMEPAD_BUTTONS.PAD_DOWN,
            { key: gf.GAMEPAD_BUTTONS.PAD_LEFT, timeout: 1000 },
            { key: gf.GAMEPAD_BUTTONS.PAD_UP},
        ]);
        const element = await gf.get(`#sequence-test`);
        assert(await element.waitForStyles({ transform: 'scale3d(1.1, 1.1, 1)', 'background-color': 'rgba(100, 100, 100, 1)' }));
        assert(await element.waitForText('Sequence tested!'));

        await gf.executeScript((down, left, up) => {
            //@ts-ignore
            gamepad.off([down], window.onDown);
            //@ts-ignore
            gamepad.off([left], window.onLeft);
            //@ts-ignore
            gamepad.off([up], window.onUp);
            document.getElementById('sequence-test').style.display = 'none';
        }, gf.GAMEPAD_BUTTONS.PAD_DOWN, gf.GAMEPAD_BUTTONS.PAD_LEFT, gf.GAMEPAD_BUTTONS.PAD_UP);
    });

    it(`Should move left stick`, async () => {
        const xPos = 0.5;
        const yPos = -0.5;
        const gamepad = gf.getGamepad(GAMEPAD_ID);
        const element = await gf.get(`#10`);
        assert(await element.waitForStyles({ transform: 'translate(0px, 0px)' }));
        await gamepad.moveLeftStick(xPos, yPos);
        assert(await element.waitForStyles({ transform: `translate(${xPos * 12}px, ${yPos * 12}px)` }));
        await gamepad.resetSticks();
        assert(await element.waitForStyles({ transform: `translate(0px, 0px)` }));
    });

    it(`Should move right stick`, async () => {
        const xPos = 0.5;
        const yPos = -0.5;
        const gamepad = gf.getGamepad(GAMEPAD_ID);
        const element = await gf.get(`#11`);
        assert(await element.waitForStyles({ transform: 'translate(0px, 0px)' }));
        await gamepad.moveRightStick(xPos, yPos);
        assert(await element.waitForStyles({ transform: `translate(${xPos * 12}px, ${yPos * 12}px)` }));
        await gamepad.resetSticks();
        assert(await element.waitForStyles({ transform: `translate(0px, 0px)` }));
    });

    it(`Should hold without set timeout and then release the button after 1000ms`, async () => {
        const gamepad = gf.getGamepad(GAMEPAD_ID);
        const element = await gf.get(`#${gf.GAMEPAD_BUTTONS.FACE_BUTTON_DOWN}`);
        assert.equal(await element.getAttribute('fill'), '#A9A8A9');
        await gamepad.hold(gf.GAMEPAD_BUTTONS.FACE_BUTTON_DOWN);
        assert(await element.waitForAttributes({ fill: 'rgb(0,0,0)' }));
        await gf.sleep(1000);
        await gamepad.release(gf.GAMEPAD_BUTTONS.FACE_BUTTON_DOWN);
        assert.equal(await element.getAttribute('fill'), '#A9A8A9');
    });

    Object.values(gf.GAMEPAD_BUTTONS).forEach((button) => {
        if (button === gf.GAMEPAD_BUTTONS.CENTER_BUTTON) return;

        it(`Should press ${button}`, async () => {
            const gamepad = gf.getGamepad(GAMEPAD_ID);
            await gamepad.press(button);
            assert(await (await gf.get(`#last-pressed`)).waitForText(button + ''));
        });
    })

    it(`Should press multiple buttons`, async () => {
        const buttons = [gf.GAMEPAD_BUTTONS.PAD_RIGHT, gf.GAMEPAD_BUTTONS.FACE_BUTTON_DOWN, gf.GAMEPAD_BUTTONS.LEFT_ANALOGUE_STICK];
        await gf.executeScript((actions) => {
            // @ts-ignore
            window.test = () => { document.getElementById('last-pressed').style = 'background: rgb(100, 100, 100);'; }
            // @ts-ignore
            gamepad.on({
                actions,
                callback: test
            });
        }, buttons);
        const gamepad = gf.getGamepad(GAMEPAD_ID);
        await gamepad.press(buttons);
        assert(await (await gf.get(`#last-pressed`)).waitForStyles({ 'background-color': 'rgba(100, 100, 100, 1)' }));
        await gf.executeScript((actions) => {
            // @ts-ignore
            gamepad.off(actions, window.test);
            document.getElementById('last-pressed').style = 'background: none;';
        }, buttons);
    });

    it(`Should hold multiple buttons`, async () => {
        const buttons = [gf.GAMEPAD_BUTTONS.PAD_RIGHT, gf.GAMEPAD_BUTTONS.FACE_BUTTON_DOWN, gf.GAMEPAD_BUTTONS.LEFT_ANALOGUE_STICK]
        const elements = await Promise.all(buttons.map(async button => await gf.get(`#${button}`)));

        const gamepad = gf.getGamepad(GAMEPAD_ID);
        for (const element of elements) {
            assert.equal(await element.getAttribute('fill'), '#A9A8A9');
        }
        await gamepad.hold(buttons);
        for (const element of elements) {
            assert(await element.waitForAttributes({ fill: 'rgb(0,0,0)' }));
        }
        await gamepad.release(buttons);
        for (const element of elements) {
            assert.equal(await element.getAttribute('fill'), '#A9A8A9');
        }
    });

    Object.values(gf.GAMEPAD_BUTTONS).forEach((button) => {
        if (button === gf.GAMEPAD_BUTTONS.CENTER_BUTTON) return;

        it(`Should hold ${button} button`, async () => {
            const gamepad = gf.getGamepad(GAMEPAD_ID);
            const element = await gf.get(`#${button}`);
            assert.equal(await element.getAttribute('fill'), '#A9A8A9');
            await gamepad.hold(button);
            assert(await element.waitForAttributes({ fill: 'rgb(0,0,0)' }));
            await gamepad.release(button);
            assert.equal(await element.getAttribute('fill'), '#A9A8A9');
        });
    })

    it(`Should disconnect gamepad`, async () => {
        const gamepadElement = await gf.get('#gamepad');
        assert.equal(await gamepadElement.isVisible(), true);
        await gf.disconnectGamepad(GAMEPAD_ID);
        assert.equal(await gamepadElement.isVisible(), false);
    });
});