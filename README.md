# node-pdf2img-promises

[![Build Status](https://travis-ci.org/jonathas/node-pdf2img-promises.svg?branch=master)](https://travis-ci.org/jonathas/node-pdf2img-promises)

A Node.js module for converting a pdf into an image file, using Promises.

This module is based on [pdf2img](https://github.com/fitraditya/node-pdf2img) by [Fitra Aditya](https://github.com/fitraditya).

- It was completely refactored to use async/await instead of callbacks
- Error handling was improved
- The async lib dependency was removed
- An option to inform the desired image quality was implemented
- The lib is now an EventEmitter, so you can listen to the file conversion progress

## Dependencies

These dependencies must be installed on your server, as the gm package uses them:

- GraphicsMagick
- GhostScript

## Installation

```
  $ npm install pdf2img-promises
```

## Usage

```javascript
const fs      = require('fs');
const path    = require('path');
const Pdf2Img = require('pdf2img-promises');

let input   = __dirname + '/test.pdf';
let fileName = 'test';

let converter = new Pdf2Img();

// The event emitter is emitting to the file name
converter.on(fileName, (msg) => {
    console.log('Received: ', msg);
});

converter.setOptions({
  type: 'png',                                // png or jpg, default jpg
  size: 1024,                                 // default 1024
  density: 600,                               // default 600
  quality: 100,                               // default 100
  outputdir: __dirname + path.sep + 'output', // output folder, default null (if null given, then it will create folder name same as file name)
  outputname: fileName,                       // output file name, dafault null (if null given, then it will create image name same as input name)
  page: null                                  // convert selected page, default null (if null given, then it will convert all pages)
});

converter.convert(input)
  .then(info => {
    console.log(info);
  })
  .catch(err => {
    console.error(err);
  })
```

It will return array of splitted and converted image files.

```javascript
{ result: 'success',
  message: 
   [ { page: 1,
       name: 'test_1.jpg',
       size: 17.275,
       path: '/output/test_1.jpg' },
     { page: 2,
       name: 'test_2.jpg',
       size: 24.518,
       path: '/output/test_2.jpg' },
     { page: 3,
       name: 'test_3.jpg',
       size: 24.055,
       path: '/output/test_3.jpg' } ] }
```

## Maintainer

[Jon Ribeiro][0]

## License

MIT

[0]: https://github.com/jonathas
