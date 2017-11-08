"use strict";

const fs = require('fs');
const gm = require('gm');
const path = require('path');

let options = {
    type: 'jpg',
    size: 1024,
    density: 600,
    outputdir: null,
    outputname: null,
    page: null
};

let Pdf2Img = function() {};

Pdf2Img.prototype.setOptions = function(opts) {
    options.type = opts.type || options.type;
    options.size = opts.size || options.size;
    options.density = opts.density || options.density;
    options.outputdir = opts.outputdir || options.outputdir;
    options.outputname = opts.outputname || options.outputname;
    options.page = opts.page || options.page;
};

Pdf2Img.prototype.convert = function(input, callbackreturn) {
    // Make sure it has correct extension
    if (path.extname(path.basename(input)) != '.pdf') {
        return callbackreturn({
            result: 'error',
            message: 'Unsupported file type.'
        });
    }

    // Check if input file exists
    if (!isFileExists(input)) {
        return callbackreturn({
            result: 'error',
            message: 'Input file not found.'
        });
    }

    let stdout = [];
    let output = path.basename(input, path.extname(path.basename(input)));

    // Set output dir
    if (options.outputdir) {
        options.outputdir = options.outputdir + path.sep;
    } else {
        options.outputdir = output + path.sep;
    }

    // Create output dir if it doesn't exists
    if (!isDirExists(options.outputdir)) {
        fs.mkdirSync(options.outputdir);
    }

    // Set output name
    if (options.outputname) {
        options.outputname = options.outputname;
    } else {
        options.outputname = output;
    }

    async.waterfall([
        // Get pages count
        function(callback) {
            gm(input).identify("%p ", function(err, value) {
                let pageCount = String(value).split(' ');

                if (!pageCount.length) {
                    callback({
                        result: 'error',
                        message: 'Invalid page number.'
                    }, null);
                } else {
                    // Convert selected page
                    if (options.page !== null) {
                        if (options.page < pageCount.length) {
                            callback(null, [options.page]);
                        } else {
                            callback({
                                result: 'error',
                                message: 'Invalid page number.'
                            }, null);
                        }
                    } else {
                        callback(null, pageCount);
                    }
                }

            })

        },


        // Convert pdf file
        function(pages, callback) {
            // Use eachSeries to make sure that conversion has done page by page
            async.eachSeries(pages, function(page, callbackmap) {
                let inputStream = fs.createReadStream(input);
                let outputFile = options.outputdir + options.outputname + '_' + page + '.' + options.type;

                convertPdf2Img(inputStream, outputFile, parseInt(page), function(error, result) {
                    if (error) {
                        return callbackmap(error);
                    }

                    stdout.push(result);
                    return callbackmap(error, result);
                });
            }, function(e) {
                if (e) callback(e);

                return callback(null, {
                    result: 'success',
                    message: stdout
                });
            });
        }
    ], callbackreturn);
};

let convertPdf2Img = function(input, output, page, callback) {
    if (input.path) {
        let filepath = input.path;
    } else {
        return callback({
            result: 'error',
            message: 'Invalid input file path.'
        }, null);
    }

    let filename = filepath + '[' + (page - 1) + ']';

    gm(input, filename)
        .density(options.density, options.density)
        .resize(options.size)
        .quality(100)
        .write(output, function(err) {
            if (err) {
                return callback({
                    result: 'error',
                    message: 'Can not write output file.'
                }, null);
            }

            if (!(fs.statSync(output)['size'] / 1000)) {
                return callback({
                    result: 'error',
                    message: 'Zero sized output image detected.'
                }, null);
            }

            let results = {
                page: page,
                name: path.basename(output),
                size: fs.statSync(output)['size'] / 1000.0,
                path: output
            };

            return callback(null, results);
        });
};

// Check if directory is exists
let isDirExists = function(path) {
    try {
        return fs.statSync(path).isDirectory();
    } catch (e) {
        return false;
    }
}

// Check if file is exists
let isFileExists = function(path) {
    try {
        return fs.statSync(path).isFile();
    } catch (e) {
        return false;
    }
}

module.exports = new Pdf2Img;