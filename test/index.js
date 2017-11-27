let fs = require('fs');
let util = require('util');
let path = require('path');
const chai = require('chai');
chai.expect();
chai.should();
const Pdf2img = require('../index.js');
const mkdir = util.promisify(fs.mkdir);
const rmdir = util.promisify(fs.rmdir);
const unlink = util.promisify(fs.unlink);
const readdir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);
console.error = () => null;

const input = `${__dirname}${path.sep}test.pdf`;
const testDir = `${__dirname}${path.sep}testdir.pdf`;
const outputDir = `${__dirname}${path.sep}output`;
const fakeFile = `${__dirname}${path.sep}fake.pdf`;

const converter = new Pdf2img();

converter.setOptions({
    outputdir: outputDir,
    outputname: 'test'
});

const checkMessages = (info, fileType = 'jpg') => {
    let n = 1;
    for (let file of info.message) {
        file.page.should.equal(n);
        file.name.should.equal(`test_${n}.${fileType}`);
        fs.statSync(file.path).isFile().should.be.true;
        if (n === 3) return true;
        n++;
    }
};

const checkSingleMessage = (info, page, fileType = 'jpg') => {
    info.message.length.should.equal(1);
    let file = info.message[0];
    file.page.should.equal(page);
    file.name.should.equal(`test_${page}.${fileType}`);
    fs.statSync(file.path).isFile().should.be.true;
};

describe('# Pdf2Img', function () {
    this.timeout(100000);

    it('should create jpg files', function () {
        return converter.convert(input)
            .then(info => {
                info.result.should.equal('success');
                checkMessages(info);
            });
    });

    it('should create png files', function () {
        converter.setOptions({
            type: 'png'
        });
        return converter.convert(input)
            .then(info => {
                info.result.should.equal('success');
                checkMessages(info, 'png');
            });
    });

    it('should create jpg file only for given page', () => {
        converter.setOptions({
            type: 'jpg',
            page: 1
        });
        return converter.convert(input)
            .then(info => {
                info.result.should.equal('success');
                checkSingleMessage(info, 1);
            });
    });

    it('should create png file only for given page', () => {
        converter.setOptions({
            type: 'png',
            page: 2
        });
        return converter.convert(input)
            .then(info => {
                info.result.should.equal('success');
                checkSingleMessage(info, 2, 'png');
            });
    });

    it('should throw an error on invalid input path', () => {
        return converter.convert('').catch(err => {
            chai.expect(err.message).to.equal('Invalid input file path.');
        });
    });

    it('should throw an error on unsupported file type', () => {
        return converter.convert(`${__dirname}${path.sep}index.js`).catch(err => {
            chai.expect(err.message).to.equal('Unsupported file type.');
        });
    });

    it('should throw an error when the input file is not a file', () => {
        return mkdir(testDir)
            .then(() => converter.convert(testDir))
            .catch(err => chai.expect(err.message).to.equal('Input file not found.'));
    });

    it('should throw an error when trying to get the number of pages of a fake file', () => {
        return writeFile(fakeFile, 'Hello there, I am not really a pdf file', 'utf8')
            .then(() => converter.convert(fakeFile))
            .catch(err => chai.expect(err.message).to.contain('Command failed'));
    });

    after(() => {
        return rmdir(testDir)
            .then(() => {
                return readdir(outputDir).then(files => {
                    let promises = files.map(file => unlink(`${outputDir}${path.sep}${file}`));
                    return Promise.all(promises);
                });
            })
            .then(() => rmdir(outputDir))
            .then(() => unlink(fakeFile));
    });
});