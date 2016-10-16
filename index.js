'use strict';

const scraper = require('./scraper');

//const entryPoint = 'http://www.svd.se';
const entryPoint = 'http://www.svd.se';

function exitCleanup() {
  console.log('waiting for clean-up...');
  scraper.initiateShutdown();
}
process.on('exit', exitCleanup);
process.on('SIGINT', exitCleanup);


scraper.scrape(entryPoint);
