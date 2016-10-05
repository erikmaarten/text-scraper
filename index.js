"use strict";

const http = require('http');
const https = require('https');

const entryPoint = 'http://www.svd.se';
const queue = [entryPoint];

http.get(queue.pop(), function(res) {
  console.log('statusCode:', res.statusCode);
}).on('error', function(e) {
  console.log('Got error:', e.message);
});

function extractLinks(sourceText) {
  // TODO
}

function saveResults() {
  // TODO
}
