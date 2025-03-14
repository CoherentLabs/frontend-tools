const RETRY_INTERVAL = 100;

class Utils {
    constructor() {
        this.retryIfFails = this.retryIfFails.bind(this);
    }

    _retryInner(action, resolve, reject, remainingCount) {
        action().then(resolve).catch((error) => {
            if (remainingCount) {
                remainingCount--;

                setTimeout(() => {
                    this._retryInner(action, resolve, reject, remainingCount);
                }, RETRY_INTERVAL);
            } else {
                reject(error);
            }
        });
    }

    /**
     * Retries the given action if it fails, up to a specified number of attempts.
     * @param {Function} action - The action to be retried.
     * @param {number} [retryCount=10] - The number of retry attempts. Defaults to 10.
     * @returns {Promise} A promise that resolves if the action succeeds within the retry attempts, or rejects if all attempts fail.
     */
    retryIfFails(action, retryCount = 10) {
        return new Promise((resolve, reject) => {
            this._retryInner(action, resolve, reject, retryCount);
        });
    }

    /**
     * Pauses the execution for a specified amount of time.
     * @param {number} time - The amount of time to sleep in milliseconds.
     * @returns {Promise<void>} A promise that resolves after the specified time has elapsed.
     */
    async sleep(time) {
        return new Promise((r) => setTimeout(r, time));
    }
}

module.exports = new Utils();