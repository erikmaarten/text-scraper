const Link = Object.create(null);
const _ = require('lodash');


Link.removeParams = (link) => {
  const indices = [
    link.indexOf('?'),
    link.indexOf('#'),
    link.indexOf('%')
  ];
  _.pull(indices, -1);
  const smallest = _.reduce(indices, (memo, curr) => Math.min(memo, curr));
  return link.slice(0, smallest);
};

Link.ext = function(url) {
  const part = url.substr(1 + url.lastIndexOf('/')).split('?')[0];
  return part.substr(1 + part.lastIndexOf('.'));
};

const notHtml = [
  'avi',
  'css',
  'gif',
  'jpg',
  'js',
  'mov',
  'mp3',
  'mp4',
  'ogg',
  'ogv',
  'pdf',
  'png',
  'svg',
  'swf',
];

Link.maybeHtml = function(cleanLink) {
  const extension = Link.ext(cleanLink);
  const isNotHtml = notHtml.indexOf(extension) !== -1;
  if (isNotHtml) {
    return false;
  }
  return true;
};

module.exports = Link;
