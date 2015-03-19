function Index (name, db, func) {
  this.name = name;
  this.db = db;
  this.func = func;
  this._lastSeq = -1;
  this._uidMap = {};
}

Index.prototype.catchup = function () {
  var self = this;
  var changes = this.db.changesSince(this._lastSeq);

  changes.forEach(function (args) {
    self.processChange.apply(self, args);
  });
};

Index.prototype.processChange = function (op, doc, inputs, entry) {
  this._lastSeq = entry.seq;
  this.func(op, doc, inputs, entry);
};

Index.prototype.addUid = function (uid) {
  this._uidMap[uid] = true;
};

Index.prototype.removeUid = function (uid) {
  delete this._uidMap[uid];
};

Index.prototype.toggleUid = function (uid, toggle) {
  if (!!toggle) { this.addUid(uid); }
  else { this.removeUid(uid); }
};

Index.prototype.get = function () {
  this.catchup();
  return Object.keys(this._uidMap);
};

module.exports = function createIndex (name, db, func) {
  return new Index(name, db, func);
};
