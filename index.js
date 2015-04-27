'use strict';

function Fingdex (source) {
  this.source = source;
  this._changes = [];
  this._lastCuid = 0;
  this._cuidSeq = 0;
}

Fingdex.prototype.catchup = function () {
  const source = this.source;
  if (!source) { return; }

  source.catchup();

  const self = this;
  source.getChangesSince(this._lastCuid).forEach(function (change) {
    self.through(change);
    if (change._cuid) { self._lastCuid = change._cuid; }
  });
};

Fingdex.prototype.emitChange = function (change) {
  if (!change.hasOwnProperty('_cuid')) {
    change._cuid = this._cuidSeq;
    this._cuidSeq += 1;
  }

  this._changes.push(change);
};

Fingdex.prototype.getChangesSince = function (cuid) {
  // special case: fetch all available
  if (cuid == 0) { return this._changes; }

  // step back from the most recent until we find a match
	let i = this._changes.length;
  while (i > 0) {
    i -= 1;

    let change = this._changes[i];
    if (change._cuid === cuid) {
      return this._changes.slice(i+1);
    }
  }

  // ending up here means we probably want to recreate from a snapshot
  let err = new Error('End of history reached');
  console.error(err);
  console.error(err.stack);
  return [];
};

// Default behaviour: pass through with no change
Fingdex.prototype.through = function () {};

Fingdex.prototype.getSnapshot = function () {
  return {
    lastCuid: this._lastCuid
  };
};

module.exports = Fingdex;
module.exports.createDocIndex = require('./lib/doc-index');
