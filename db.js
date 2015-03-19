var createIndex = require('./lib/create-index');

var db = {};

db._lastSeq = -1;
db._watchers = [];
db._formatters = {};

var docs = db.docs = {};
var entriesByDoc = {};
var changeFeed = [];

function getNextSeq () {
  db._lastSeq += 1;
  return db._lastSeq;
}

function updateDocState (doc, inputs) {
  Object.keys(inputs).forEach(function (key) {
    doc.state[key] = inputs[key];
  });
}

function normalizeEntry (entry) {
  if (!entry.id) { entry.id = entry.ts; }
  if (!entry.type) { entry.type = ''; }
}

function getDocUidFromEntry (entry) {
  return [entry.type, entry.id].join('-');
}

function getDoc (uid) {
  return docs[uid];
}

function createDocFromEntry (entry) {
  var uid = getDocUidFromEntry(entry);
  var doc = docs[uid] = {
    seq: null,
    uid: uid,
    id: entry.id,
    type: entry.type,
    ts: entry.ts,
    state: {}
  };

  return doc;
}

function extractInputs (entry) {
  return entry.notes
    .split('\n')
    .reduce(function (acc, line) {
      var matches = line.trim().match(/^\[(.*?):(.*?)\]$/);
      if (!matches) { return acc; }

      var key = matches[1].trim();
      var val = matches[2].trim();

      acc[key] = val;
      return acc;
    }, {});
}

db.broadcast = function (doc, inputs, entry) {
  this._watchers.forEach(function (func) {
    func(doc, inputs, entry);
  });
};

db.addEntry = function (entry) {
  normalizeEntry(entry);

  var uid = getDocUidFromEntry(entry);
  var doc = getDoc(uid);
  var isEdit = true;

  entry.seq = getNextSeq();

  if (!doc) {
    isEdit = false;
    doc = createDocFromEntry(entry);

    // create a new index
    entriesByDoc[uid] = [];
  }

  // record the sequence of the last entry for this doc
  doc.seq = entry.seq;

  // index the entry
  entriesByDoc[uid].push(entry);

  var inputs = extractInputs(entry);
  var format = (doc.type && this._formatters[doc.type]);
  if (format) {
    format(inputs);
  }

  // update the doc's state
  updateDocState(doc, inputs);

  // broadcast so that other indexers can update
  var op = isEdit ? 'edit' : 'create';
  changeFeed.push([op, doc, inputs, entry]);
  this.broadcast(op, doc, inputs, entry);
};

db.changesSince = function (lastSeq) {
  return changeFeed.slice(lastSeq + 1);
};

db.watch = function (func) {
  this._watchers.push(func);
};

db.addFormatter = function (type, func) {
  this._formatters[type] = func;
};

db.getDoc = getDoc;

db.indexes = {};
db.createIndex = function (name, func) {
  if (this.indexes[name] !== undefined) {
    throw new Error('index already registered: ' + name);
  }

  var index = this.indexes[name] = createIndex(name, this, func);
  return index;
};

db.index = function (name) {
  return this.indexes[name];
};

module.exports = db;
