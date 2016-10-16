'use strict';
const _ = require('lodash');
const fs = require('fs');
const http = require('http');
const getUrls = require('get-urls');
const Writable = require('stream').Writable;
const Transform = require('stream').Transform;

const visited = [];

class PageDownloadStream extends Transform {
  constructor() {
    super();
  }
  _transform(buff, encoding, cb) {
    const link = buff.toString();
    console.log('downloading ' + link + '...');
    try {
      http.get(link, (res) => {
        console.log('statusCode:', res.statusCode);
        const responseParts = [];
        res.setEncoding('utf8');
        res.on('data', (chunk) => responseParts.push(chunk));
        res.on('end', () => {
          cb(null, responseParts.join(''));
        }).on('error', function(err) {
          console.error(err);
          cb(err);
        });
      });
    } catch(e) {
      console.error('caught error');
    }
    console.log('after try/catch');
  }
  end() {
    console.log('in end in stream');
    const writeable = fs.createWriteStream('./found_links.txt');
    writeable.write(_.uniq(visited).join('\n'));
    console.log('ending...');
  }
}

module.exports = PageDownloadStream;
