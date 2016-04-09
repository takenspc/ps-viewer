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

const ENGINES = ['chromium', 'edge', 'webkit', 'gecko'];


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

/**
 * @param urlEntries {any[]}
 * @param host {string}
 */
function queryUrlEntriesByHost(urlEntries, host) {
    const ret = [];

    for (const url of Object.keys(urlEntries).sort()) {
        const urlEntry = urlEntries[url];
        if (urlEntry.host === host) {
            ret.push(urlEntry);
        }
    }

    return ret;
}


/**
 * @param set {Set<string>}
 * @returns {string[]}
 */
function converSetToArray(set) {
    const array = [];
    for (const value of set) {
        array.push(value);
    }
    return array.sort();
}

/**
 * @param map {Map<string, Set<string>>}
 * @returns {any}
 */
function converMapToObj(map) {
    const obj = {};
    for (const pair of map) {
        obj[pair[0]] = converSetToArray(pair[1]);
    }
    return obj;
}


/**
 * @param data {any}
 * @param urlString {string}
 * @returns {any}
 */
function queryByUrl(data, urlString) {
    const urls = {};
    const entities = new Map();

    for (const url of Object.keys(data.urls).sort()) {
        const urlEntry = data.urls[url];
        if (urlEntry.url === urlString) {
            urls[urlEntry.url] = urlEntry;

            const entity = urlEntry.entity;
            if (!entities.has(entity)) {
                entities.set(entity, new Set());
            }
            const host = urlEntry.host;
            entities.get(entity).add(host);
        }
    }

    return {
        urls: urls,
        entities: converMapToObj(entities),
        redirects: data.redirects,
    };
}


/**
 * @param data {any}
 * @param host {string}
 * @returns {any}
 */
function queryByHost(data, host) {
    const urls = {};
    const entities = new Map();

    for (const url of Object.keys(data.urls).sort()) {
        const urlEntry = data.urls[url];
        if (urlEntry.host === host) {
            urls[urlEntry.url] = urlEntry;

            const entity = urlEntry.entity;
            if (!entities.has(entity)) {
                entities.set(entity, new Set());
            }
            const host = urlEntry.host;
            entities.get(entity).add(host);
        }
    }

    return {
        urls: urls,
        entities: converMapToObj(entities),
        redirects: data.redirects,
    };
}

/**
 * @param data {any}
 * @param engine {string}
 * @returns {any}
 */
function queryByEngine(data, engine) {
    const urls = {};
    const entities = new Map();

    for (const url of Object.keys(data.urls).sort()) {
        const urlEntry = data.urls[url];
        const newFragments = {};
        let found = false;

        for (const fragment of Object.keys(urlEntry.fragments)) {
            const fragmentEntry = urlEntry.fragments[fragment];

            if (fragmentEntry.engines[engine]) {
                const newFragmentEntry = Object.assign({}, fragmentEntry);
                newFragmentEntry.engines = {};
                newFragmentEntry.engines[engine] = fragmentEntry.engines[engine];
                newFragments[fragment] = newFragmentEntry;
                found = true;
            }
        }

        if (!found) {
            continue;
        }

        const newUrlEntry = Object.assign({}, urlEntry);
        newUrlEntry.fragments = newFragments;
        urls[newUrlEntry.url] = newUrlEntry;

        const entity = newUrlEntry.entity;
        if (!entities.has(entity)) {
            entities.set(entity, new Set());
        }
        const host = newUrlEntry.host;
        entities.get(entity).add(host);
    }

    return {
        urls: urls,
        entities: converMapToObj(entities),
        redirects: data.redirects,
    };
}


/**
 * @param data {any}
 * @returns {any}
 */
function queryHasRedirects(data) {
    const urls = {};
    const entities = new Map();

    for (const url of Object.keys(data.urls).sort()) {
        const urlEntry = data.urls[url];
        const newFragments = {};
        let fragmentFound = false;

        for (const fragment of Object.keys(urlEntry.fragments)) {
            const fragmentEntry = urlEntry.fragments[fragment];
            const newFragmentEntry = Object.assign({}, fragmentEntry);
            newFragmentEntry.engines = {};
            let engineFound = false;

            const engines = fragmentEntry.engines;
            for (const engine of Object.keys(engines)) {
                const newStatusEntries = engines[engine].filter((entry) => {
                    return !!data.redirects[entry.url];
                });

                if (newStatusEntries.length > 0) {
                    newFragmentEntry.engines[engine] = newStatusEntries;
                    engineFound = true;
                }
            }
            
            if (engineFound) {
                newFragments[fragment] = newFragmentEntry;
                fragmentFound = true;
            }
        }

        if (!fragmentFound) {
            continue;
        }

        const newUrlEntry = Object.assign({}, urlEntry);
        newUrlEntry.fragments = newFragments;
        urls[newUrlEntry.url] = newUrlEntry;

        const entity = newUrlEntry.entity;
        if (!entities.has(entity)) {
            entities.set(entity, new Set());
        }
        const host = newUrlEntry.host;
        entities.get(entity).add(host);
    }

    return {
        urls: urls,
        entities: converMapToObj(entities),
        redirects: data.redirects,
    };
}


module.exports = {
    ENGINES: ENGINES,
    getPlatformStatusId: getPlatformStatusId,
    getPlatformStatusUrl: getPlatformStatusUrl,
    getHost: getHost,
    queryUrlEntriesByHost: queryUrlEntriesByHost,
    queryByUrl: queryByUrl,
    queryByHost: queryByHost,
    queryByEngine: queryByEngine,
    queryHasRedirects: queryHasRedirects,
};
