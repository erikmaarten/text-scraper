const EventEmitter = require('events').EventEmitter;
const http = require('http');
const https = require('https');
const getUrls = require('get-urls');
const Database = require('./db/Database');
const Link = require('./lib/hyperlinks');

//const nstore = require('nstore');

const linkDatabase = new Database('./db/linkDatabase.txt');
const failureDatabase = new Database('./db/failureDatabase.txt');

function isHttp(link) {
  return link.slice(0, 5) === 'http:';
}
function isHttps(link) {
  return link.slice(0, 5) === 'https';
}
function getProtocol(link) {
  if (isHttp(link)) {
    return http;
  } else if (isHttps(link)) {
    return https;
  } else {
    return;
  }
}

function logIfError(err) {
  if (err) {
    console.log(err.message);
  }
}

function Scraper() {
  this.fetchedPages = 0;
  this.failedFetches = 0;
  this.shuttingDown = false;
  this.asyncOps = 0;

  this.on('pageDownloaded', (link, page) => {
    this.fetchedPages++;
    linkDatabase.set(link, 1, logIfError);
    if (!this.shuttingDown) {
      getUrls(page).forEach( url => this.emit('foundLink', url));
    }
  });

  this.on('foundLink', (rawLink) => {
    const link = Link.removeParams(rawLink);
    if (Link.maybeHtml(link) === false) {
      console.log('not html, returning', link);
      return;
    }

    if (this.alreadyTried(link)) {
      return;
    }

    console.log('probably html', link);

    const protocol = getProtocol(link);
    if (!protocol) {
      console.log('no protocol found for: ' + link);
      return;
    }

    const scraper = this;
    scraper.asyncOps++;
    protocol.get(link, function(res) {
      if (res.statusCode !== 200) {
        console.log('link get failed: ' + link + `statusCode ${res.statusCode}`);
        scraper.failedFetches++;
        failureDatabase.set(link, res.statusCode);
        scraper.asyncOps--;
        scraper.shuttingDown ? scraper.attemptShutdown() : '';
      } else {
        const responseParts = [];
        res.setEncoding('utf8');
        res.on('data', (chunk) => responseParts.push(chunk));
        res.on('end', () => {
          console.log('link get succeeded: ' + link);
          scraper.emit('pageDownloaded', link, responseParts.join(''));
          scraper.asyncOps--;
          scraper.shuttingDown ? scraper.attemptShutdown() : '';
        });
      }
    }).on('error', (e) => {
      scraper.asyncOps--;
      this.failedFetches++;
      console.error('Got errror fetching ' + link + ':', e.message);
    });
  });
}

Scraper.prototype = Object.create(EventEmitter.prototype);


Scraper.prototype.attemptShutdown = function() {
  this.logOps();
  if (this.asyncOps === 0) {
    this.finish();
  }
};
Scraper.prototype.logOps = function() {
  console.log('Number of async ops remaining: ' + this.asyncOps);
};
Scraper.prototype.initiateShutdown = function() {
  this.shuttingDown = true;
};
Scraper.prototype.alreadyTried = function(link) {
  const fetched = linkDatabase.get(link) !== null;
  if (fetched) linkDatabase.set(link, linkDatabase.get(link) + 1);
  const failed = failureDatabase.get(link) !== null;
  if (failed) failureDatabase.set(link, failureDatabase.get(link) + 1);
  return fetched || failed;
};

Scraper.prototype.scrape = function(link) {
  linkDatabase.on('load', () => {
    this.emit('foundLink', link);
  });
};

Scraper.prototype.finish = function() {
  linkDatabase.close();
  console.log('documents fetched:', this.fetchedPages);
  console.log('failures:', this.failedFetches);
};

const scraper = new Scraper();

module.exports = scraper;
