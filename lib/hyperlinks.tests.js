'use strict';
const Link = require('./hyperlinks');
const assert = require('assert');

let numPasses = 0;

const nonHtml = [
  'https://assets.svd.se/assets/images/framework/svd-logo.04a71eff.svg',
  'https://assets.svd.se/assets/stylesheets/application.99bbd91d.css',
  'http://cdn.optimizely.com/js/1600000590.js',
  'https://assets.svd.se/assets/images/favicon/android-chrome-192x192.d60aacce.png'
];

let actual = Link.ext(nonHtml[0]);
assert.equal(actual, 'svg', 'expected svg extension, got ' + actual);
actual = Link.ext(nonHtml[1]);
assert.equal(actual, 'css', 'expected svg extension, got ' + actual);

for (let i = 0; i < nonHtml.length; i++) {
  assert.equal(Link.maybeHtml(nonHtml[i]), false, nonHtml[i]);
  numPasses++;
}


console.log('NUM PASSES: ' + numPasses);
