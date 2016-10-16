'use strict';

const fs = require('fs');
const EventEmitter = require('events').EventEmitter;

function Database(path) {
  this.path = path;
  this._records = Object.create(null);
  this._writeStream = fs.createWriteStream(this.path, {
    encoding: 'utf8',
    flags: 'a'
  });

  this._load();
}

Database.prototype = Object.create(EventEmitter.prototype);

Database.prototype._load = function() {
  const database = this;
  const rstream = fs.createReadStream(database.path, {
    encoding: 'utf8',
    flags: 'r'
  });

  let data = '';
  rstream.on('readable', () => {
    data += rstream.read();
    const records = data.split('\n');
    data = records.pop();

    records.forEach(r => {
      try {
        const record = JSON.parse(r);
        if (record.value === null) {
          delete database._records[record.key];
        } else {
          database._records[record.key] = record.value;
        }
      } catch(e) {
        database.emit('error', 'found invalid record:' + r);
      }
    });
  });

  rstream.on('end', () => {
    database.emit('load');
  });
};

Database.prototype.close = function() {
  this._writeStream.end();
};

Database.prototype.get = function(key) {
  return this._records[key] || null;
};

Database.prototype.del = function(key) {
  delete this._records[key];
  this._writeStream.write(JSON.stringify({key: key, value: null}) + '\n');
};

Database.prototype.set = function(key, value, cb) {
  const toWrite = JSON.stringify({key: key, value: value}) + '\n';
  this._records[key] = value;
  this._writeStream.write(toWrite, cb);
};

module.exports = Database;
