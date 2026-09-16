/**
 * The probe injected into the served HTML before the app's own scripts run.
 *
 * It exists because the Player has no DOMDebugger domain and silently ignores
 * `Page.addScriptToEvaluateOnNewDocument`, so the only way to know which elements ended up
 * with event listeners - the "interactable" test that keeps a node live in element mode -
 * is to watch `addEventListener` from inside the page, from the first line onwards.
 */
export const PROBE_SNIPPET = `<script>(function () {
    var listeners = new WeakSet();
    var original = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function (type, listener, options) {
        try {
            if (this && this.nodeType === 1) listeners.add(this);
        } catch (e) {
            /* never let bookkeeping break the app under test */
        }
        return original.call(this, type, listener, options);
    };

    window.__rzProbe = {
        hasListener: function (el) {
            try {
                return listeners.has(el);
            } catch (e) {
                return false;
            }
        },
    };
})();</script>`;
