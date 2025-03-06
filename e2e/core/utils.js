const RETRY_INTERVAL = 100;

function _retryInner(action, resolve, reject, remainingCount) {
    action().then(resolve).catch((error) => {
        if (remainingCount) {
            remainingCount--;

            setTimeout(() => {
                _retryInner(action, resolve, reject, remainingCount);
            }, RETRY_INTERVAL);
        } else {
            reject(error);
        }
    });
}

function retryIfFails(action, retryCount = 10) {
    return new Promise((resolve, reject) => {
        _retryInner(action, resolve, reject, retryCount);
    });
}

async function sleep(time) {
    return new Promise((r) => setTimeout(r, time));
}

module.exports = {
    retryIfFails,
    sleep,
}