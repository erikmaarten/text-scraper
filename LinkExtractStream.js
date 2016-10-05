"use strict";

var Writable = require('stream').Writable;

class LinkExtractStream extends Writable {
  constructor() {
    super();
  }
  write(chunk, encoding, cb) {
    const textChunk = chunk.toString();
    console.log('read chunk:', textChunk);
  }
}

module.exports = LinkExtractStream;
