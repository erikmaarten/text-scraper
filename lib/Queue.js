const EventEmitter = require('events').EventEmitter;

function Queue() {
  this._queue = [];
}

Queue.prototype = Object.create(EventEmitter.prototype);

Queue.prototype.enqueue = function(item) {
  this._queue.splice(0, 0, item);
  this.emit('enqueue', item);
};

Queue.prototype.dequeue = function() {
  const popped = this._queue.pop();
  this.emit('dequeue', popped);
  return popped;
};

module.exports = Queue;
