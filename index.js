"use strict";

const child = require('child_process');
const pdf2img = require('./lib/pdf2img');

module.exports = (() => {
    child.exec(`which graphicsmagick`, (err, stdout, stderr) => {
        if (err) {
            console.error('Please install graphicsmagick in order to run pdf2img');
            process.exit(1);
        }
        return pdf2img;
    });
})();