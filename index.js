"use strict";

const http = require('http');
const https = require('https');

const LinkExtractStream = require('./LinkExtractStream');
const linkExtractStream = new LinkExtractStream();

// IDEA: Create an event emitter that emits an event when a new link has been
// discovered, and create an event listener that listens to that event and then
// takes the new link and sends it to the crawler.
const entryPoint = 'http://www.svd.se';
const queue = [entryPoint];

http.get(queue.pop(), function(res) {
  console.log('statusCode:', res.statusCode);
  const responseParts = [];
  res.setEncoding('utf8');
  res.on('data', (chunk) => responseParts.push(chunk));
  res.on('end', () => {
    linkExtractStream.write(responseParts.join(''));
    linkExtractStream.end();
  });
}).on('error', function(e) {
  console.log('Got error:', e.message);
});

// TODO: Wait for all data for a particular page to download, then send to
// link extract stream

function extractLinks(sourceText) {
  // TODO
}

function saveResults() {
  // TODO
}
