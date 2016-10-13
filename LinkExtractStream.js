"use strict";
const _ = require('lodash');
const fs = require('fs');
const getUrls = require('get-urls');
const Writable = require('stream').Writable;

const visited = [];

class LinkExtractStream extends Writable {
  constructor() {
    super();
  }
  write(chunk, encoding, cb) {
    console.log('in write in stream');
    const textChunk = chunk.toString();
    const urls = getUrls(textChunk);
    _.each(urls, url => visited.push(url));
  }
  end() {
    console.log('in end in stream');
    const writeable = fs.createWriteStream('./found_links.txt');
    writeable.write(_.uniq(visited).join('\n'));
    console.log('ending...');
  }
}

module.exports = LinkExtractStream;
