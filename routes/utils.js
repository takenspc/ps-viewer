'use strict';
var fs = require('fs');
var path = require('path');


const engines = ['chromium', 'edge', 'webkit', 'gecko'];

/**
 * @param filePath {string}
 * @returns Promise<string>
 */
function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, text) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(text);
        });
    });
}

/**
 * @returns Promise<any>
 */
function readJSON() {
    const jsonPath = path.join(__dirname, '..', 'data', 'data.json');
    return readFile(jsonPath).then((text) => {
        const data = JSON.parse(text);
        Object.freeze(data);
        return data;
    });
}

module.exports = {
    engines: engines,
    readJSON: readJSON
};
