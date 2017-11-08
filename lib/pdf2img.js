const fs = require('fs');
const gm = require('gm');
const path = require('path');
const util = require('util');
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);

class Pdf2Img {
    constructor() {
        this.options = {
            type: 'jpg',
            size: 1024,
            density: 600,
            outputdir: null,
            outputname: null,
            page: null
        };
    }

    setOptions(opts) {
        this.options.type = opts.type || this.options.type;
        this.options.size = opts.size || this.options.size;
        this.options.density = opts.density || this.options.density;
        this.options.outputdir = opts.outputdir || this.options.outputdir;
        this.options.outputname = opts.outputname || this.options.outputname;
        this.options.page = opts.page || this.options.page;
    }

    async convert(input) {
        try {
            await this.validate(input);
            let pages = await this.getPagesCount(input);
            return this.convertPdf(input, pages);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async validate(input) {
        if (!input) {
            throw new Error('Invalid input file path.');
        }

        if (path.extname(path.basename(input)) != '.pdf') {
            throw new Error('Unsupported file type.');
        }

        let statInput = await stat(input);

        if (!statInput.isFile()) {
            throw new Error('Input file not found.');
        }
    }

    getPagesCount(input) {
        return new Promise((resolve, reject) => {
            gm(input).identify('%p ', (err, value) => {
                if (err) return reject(err);

                let pageCount = String(value).split(' ');

                if (!pageCount.length) {
                    return reject('Invalid page number.');
                } else {
                    // Convert selected page
                    if (this.options.page !== null) {
                        if (this.options.page < pageCount.length) {
                            return resolve([this.options.page]);
                        } else {
                            return reject('Invalid page number.');
                        }
                    } else {
                        return resolve(pageCount);
                    }
                }
            });
        });
    }

    async convertPdf(input, pages) {
        try {
            let stdout = [];
            let output = this.getOutput(input);
            await this.setOutDir(output);
            this.setOutName(output);

            for (let page of pages) {
                let inputStream = fs.createReadStream(input);
                let outputFile = `${this.options.outputdir}${this.options.outputname}_${page}.${this.options.type}`;
                let result = await this.convertPdf2Img(inputStream, outputFile, parseInt(page));
                stdout.push(result);
            }

            return {
                result: 'success',
                message: stdout
            };
        } catch (err) {
            throw new Error(err);
        }
    }

    getOutput(input) {
        return path.basename(input, path.extname(path.basename(input)));
    }

    async setOutDir(output) {
        if (this.options.outputdir) {
            this.options.outputdir = this.options.outputdir + path.sep;
        } else {
            this.options.outputdir = output + path.sep;
        }

        let statDir = await stat(this.options.outputdir);

        if (!statDir.isDirectory()) {
            await mkdir(this.options.outputdir);
        }
    }

    setOutName(output) {
        if (this.options.outputname) {
            this.options.outputname = this.options.outputname;
        } else {
            this.options.outputname = output;
        }
    }

    async convertPdf2Img(inputStream, output, page) {
        return new Promise((resolve, reject) => {
            let filename = `${inputStream.path}[${(page - 1)}]`;
            gm(inputStream, filename)
                .density(this.options.density, this.options.density)
                .resize(this.options.size)
                .quality(100)
                .write(output, (err) => {
                    if (err) {
                        return reject('Wasn\'t able to write the output file.');
                    }

                    stat(output).then(statOut => {
                        if ((statOut.size / 1000) === 0) {
                            return reject('Zero sized output image detected.');
                        }

                        return resolve({
                            page: page,
                            name: path.basename(output),
                            size: statOut.size / 1000.0,
                            path: output
                        });
                    });
                });
        });
    }
}

module.exports = new Pdf2Img();