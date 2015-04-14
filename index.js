'use strict';

function Fingdex (source) {
  this.source = source;
  this._items = [];
}

Fingdex.prototype.catchup = function () {
  if (this.source === undefined) { return; }

  this.source.catchup();

  var res;
  while (!!(res = this.source.read())) {
    this.through(res);
  }
};

Fingdex.prototype.append = function (item) {
  this._items.push(item);
};

Fingdex.prototype.read = function () {
  return this._items.shift();
};

// Default behaviour: pass through with no change
Fingdex.prototype.through = function () {};


module.exports = Fingdex;
module.exports.createDocIndex = require('./lib/doc-index');
