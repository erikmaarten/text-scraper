const EventEmitter = require('events').EventEmitter;
const http = require('http');
const https = require('https');
const getUrls = require('get-urls');
const Database = require('./db/Database');
const Link = require('./lib/hyperlinks');

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
  if (err) console.log(err.message);
}

function Scraper() {
  this.fetchedPages = 0;

  this.on('pageDownloaded', (link, page) => {
    console.log('fetched pages: ' + this.fetchedPages++);
    linkDatabase.set(link, 1, logIfError);
    getUrls(page).forEach( url => this.emit('foundLink', url));
  });

  this.on('foundLink', (rawLink) => {
    const link = Link.removeParams(rawLink);
    if (Link.maybeHtml(link) === false) {
      return;
    }

    const linkRecord = linkDatabase.get(link);
    if (linkRecord !== null) {
      linkDatabase.set(link, linkRecord + 1, logIfError);
      return;
    }

    const protocol = getProtocol(link);
    if (!protocol) {
      console.log('no protocol found for: ' + link);
      return;
    }

    console.log('found link: ' + link);
    const scraper = this;
    protocol.get(link, (res) => {
      if (res.statusCode !== 200) {
        failureDatabase.set(link, res.statusCode);
      } else {
        const responseParts = [];
        res.setEncoding('utf8');
        res.on('data', (chunk) => responseParts.push(chunk));
        res.on('end', () => {
          scraper.emit('pageDownloaded', link, responseParts.join(''));
        });
      }
    }).on('error', (e) => {
      console.error('Got errror fetching ' + link + ':', e.message);
    });
  });
}

Scraper.prototype = Object.create(EventEmitter.prototype);
Scraper.prototype.scrape = function(link) {
  this.emit('foundLink', link);
};

const scraper = new Scraper();

module.exports = scraper;
