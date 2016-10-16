'use strict';

const scraper = require('./scraper');

//const entryPoint = 'http://www.svd.se';
const entryPoint = 'http://www.svd.se';
scraper.scrape(entryPoint);

process.on('exit', function() {
  console.log('exiting...');
  scraper.finish();
});
