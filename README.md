# node-pdf2img-promises

[![Build Status](https://travis-ci.org/jonathas/node-pdf2img-promises.svg?branch=master)](https://travis-ci.org/jonathas/node-pdf2img-promises)

A Node.js module for converting a pdf into an image file, using Promises.

This module is based on [pdf2img](https://github.com/fitraditya/node-pdf2img) by [Fitra Aditya](https://github.com/fitraditya)

## Dependencies
- GraphicsMagick

## Installation
```
  $ npm install pdf2img-promises
```

## Usage

```javascript
const fs      = require('fs');
const path    = require('path');
const pdf2img = require('pdf2img');

let input   = __dirname + '/test.pdf';

pdf2img.setOptions({
  type: 'png',                                // png or jpg, default jpg
  size: 1024,                                 // default 1024
  density: 600,                               // default 600
  outputdir: __dirname + path.sep + 'output', // output folder, default null (if null given, then it will create folder name same as file name)
  outputname: 'test',                         // output file name, dafault null (if null given, then it will create image name same as input name)
  page: null                                  // convert selected page, default null (if null given, then it will convert all pages)
});

pdf2img.convert(input)
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
