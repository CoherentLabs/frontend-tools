/* eslint-disable no-unused-vars */
/* globals KEYS */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const DEFAULT_FRAMES_TO_WAIT = 3;

/**
 * Delay the execution of a callback function by n amount of frames.
 * Used to retrieve the computed styles of elements.
 * @param {Function} callback - the function that will be executed.
 * @param {number} count - the amount of frames that the callback execution
 * should be delayed by.
 * @returns {Function|void}
*/
function waitForStyles(callback = () => { }, count = DEFAULT_FRAMES_TO_WAIT) {
    if (count === 0) return callback();
    count--;
    requestAnimationFrame(() => waitForStyles(callback, count));
}

/**
 * Usually wraps assert() in cases where there is a need to wait before validating
 * or wraps an action which needs some frames before proceeding to a validation with assert().
 * @param {Function} callback
 * @param {number} frames
 * @returns {Promise}
 */
function createAsyncSpec(callback = () => { }, frames = DEFAULT_FRAMES_TO_WAIT) {
    return new Promise((resolve, reject) => {
        waitForStyles(() => {
            try {
                callback();
                resolve();
            } catch (error) {
                reject(error);
            }
        }, frames);
    });
}

/**
 * @param {string} selector
 */
function cleanTestPage(selector) {
    // Since we don't want to replace the whole content of the body using
    // innerHtml setter, we query only the current custom element and we replace
    // it with a new one; this is needed because the specs are executed in a random
    // order and sometimes the component might be left in a state that is not
    // ready for testing
    const testWrapper = document.querySelector(selector);

    if (testWrapper) {
        testWrapper.parentElement.removeChild(testWrapper);
    }
}

/**
 * Creates a square to work with the interaction manager
 * @returns {Promise}
 */
function createIMElement() {
    const container = document.createElement('DIV');

    container.style.width = '500px';
    container.style.height = '500px';
    container.classList.add('container');

    const template = `<div class="square" style="background-color: cadetblue; width: 200px; height: 200px;"></div>`;
    container.innerHTML = template;

    document.body.appendChild(container);

    return new Promise((resolve) => {
        waitForStyles(resolve, 3);
    });
}

/**
 *
 * @param {HTMLElement} element
 * @param {string} eventType - type of touch event - touchstart, touchmove, touchend
 * @param {Object} options
 * @param {number} options.x
 * @param {number} options.y
 * @param {HTMLElement} options.currentTarget
 * @param {HTMLElement} options.target
 * @param {number} options.identifier
 */
function simulateTouch(element, eventType, { identifier, x = 0, y = 0, target }) {
    target ||= element;
    const event = document.createEvent('Event');
    event.initEvent(eventType, true, true);
    //@ts-ignore
    event.touches = [{
        identifier,
        clientX: x,
        clientY: y,
        target: element,
        currentTarget: element,
    }];

    element.dispatchEvent(event);
}
