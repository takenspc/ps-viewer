'use strict';
const assert = require('assert');
const url = require('url');


/**
 * @param engine {string}
 * @param id {string}
 * @returns {string}
 */
function getPlatformStatusId(engine, id) {
    return engine + '-' + encodeURIComponent(id);
}


const PLATFORM_STATUS_URL_MAP = new Map([
    ['chromium', 'https://www.chromestatus.com/features/'],
    ['edge', 'https://developer.microsoft.com/en-us/microsoft-edge/platform/status/'],
    ['webkit', 'https://webkit.org/status/#'],
    ['gecko', 'https://platform-status.mozilla.org/#'],
]);

/**
 * @param engine {string}
 * @param id {string}
 * @returns {string}
 */
function getPlatformStatusUrl(engine, id) {
    assert(PLATFORM_STATUS_URL_MAP.has(engine));
    const baseUrl = PLATFORM_STATUS_URL_MAP.get(engine);
    return baseUrl + encodeURIComponent(id);
}


/**
 * @param urlString {string}
 * @returns {string}
 */
function getHost(urlString) {
    return url.parse(urlString).host;
}


module.exports = {
    getPlatformStatusId: getPlatformStatusId,
    getPlatformStatusUrl: getPlatformStatusUrl,
    getHost: getHost,
};
