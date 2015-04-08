'use strict';

var Fingdex = require('../');

module.exports = function (sourceIndex, docDefaults) {
  docDefaults = docDefaults || {};

  var docIndex = new Fingdex(sourceIndex);

  docIndex.docs = {};

  docIndex.getDoc = function (id) {
    var doc = this.docs[id];
    if (!doc) { return; }

    var defValues = docDefaults[doc._type];
    if (!defValues) { return doc; }

    Object.keys(defValues).forEach(function (key) {
      // ignore reserved keys
      if (key[0] === '_') { return; }

      if (doc[key] === undefined) {
        doc[key] = defValues[key];
      }
    });

    return doc;
  };

  docIndex.updateDoc = function (id, values) {
    var doc = this.getDoc(id);
    var prev = {};

    // NOTE: won't correctly merge beyond depth of 1
    Object.keys(values).forEach(function (key) {
      // ignore reserved keys
      if (key[0] === '_') { return; }

      prev[key] = doc[key];
      doc[key] = values[key];
    });

    return prev;
  };

  docIndex.addEntry = function (entry) {
    // ignore entries with no id
    var id = entry._id;
    if (!id) { return; }

    var isNew = false;
    var doc = this.getDoc(id);
    var prev;

    if (!doc) {
      isNew = true;
      doc = this.docs[id] = entry;
    }
    else {
      // update the doc's values
      prev = this.updateDoc(id, entry);
    }

    // index changes to docs
    var output = {
      isNew: isNew,
      _id: id,
      _type: doc._type
    };

    if (!isNew) {
      output.changes = entry;
      output.prev = prev;
    }

    this._results.push(output);
  };

  return docIndex;
};
