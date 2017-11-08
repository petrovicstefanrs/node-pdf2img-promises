let fs = require('fs');
let path = require('path');
require('chai').expect();
require('chai').should();
let pdf2img = require('../index.js');

let input = `${__dirname}${path.sep}test.pdf`;

pdf2img.setOptions({
    outputdir: `${__dirname}${path.sep}output`,
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

describe('# Pdf2Img', function() {
    this.timeout(100000);

    it('should create jpg files', function() {
        return pdf2img.convert(input)
            .then(info => {
                info.result.should.equal('success');
                checkMessages(info);
            });
    });

    it('should create png files', function() {
        pdf2img.setOptions({ type: 'png' });
        return pdf2img.convert(input)
            .then(info => {
                info.result.should.equal('success');
                checkMessages(info, 'png');
            });
    });

    it('should create jpg file only for given page', () => {
        pdf2img.setOptions({ type: 'jpg', page: 1 });
        return pdf2img.convert(input)
            .then(info => {
                info.result.should.equal('success');
                checkSingleMessage(info, 1);
            });
    });

    it('should create png file only for given page', () => {
        pdf2img.setOptions({ type: 'png', page: 2 });
        return pdf2img.convert(input)
            .then(info => {
                info.result.should.equal('success');
                checkSingleMessage(info, 2, 'png');
            });
    });
});