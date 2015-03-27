function Fingdex (source) {
  this.source = source;
  this._lastSourceSeq = -1;
  this._results = [];
}

Fingdex.prototype.catchup = function () {
  if (this.source === undefined) { return; }

  var res;

  this.source.catchup();
  while (!!(res = this.source.readNext(this._lastSourceSeq))) {
    this._lastSourceSeq = res.seq;
    this.addEntry(res.entry);
  }
};

Fingdex.prototype.addEntry = function (entry) {
  // Default behaviour: incoming entries simply become outgoing results.
  // override this function to do something more interesting.
  this._results.push(entry);
};

Fingdex.prototype.readNext = function (last) {
  // NOTE: assumes that the index has all entries in a sequential array
  var seq = last + 1;
  var entry = this._results[seq];
  if (!entry) { return null; }

  return {
    seq: seq,
    entry: entry
  };
};

module.exports = Fingdex;
