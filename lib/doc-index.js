'use strict';

var Fingdex = require('./fingdex');

var docDefaults = {};

docDefaults.team = {
  startedAt: 0
};

docDefaults.teamMembership = {
  startedAt: 0,
  hoursPerWeek: 40
};

module.exports = function (sourceIndex) {
  var docIndex = new Fingdex(sourceIndex);

  docIndex.docs = {};

  docIndex.getDoc = function (id) {
    var doc = this.docs[id];
    if (!doc) { return; }

    var defValues = docDefaults[doc.type];
    if (!defValues) { return doc; }

    doc.values = Object.assign({}, defValues, doc.values);

    return doc;
  };

  docIndex.updateDoc = function (id, values) {
    var doc = this.getDoc(id);
    var prev = {};

    // NOTE: won't correctly merge beyond depth of 1
    Object.keys(values).forEach((key) => {
      prev[key] = doc.values[key];
      doc.values[key] = values[key];
    });

    return prev;
  };

  docIndex.addEntry = function (entry) {
    // ignore entries with no id
    var id = entry.id;
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
      prev = this.updateDoc(id, entry.values);
    }

    // index changes to docs
    var output = {
      isNew: isNew,
      id: id,
      type: doc.type
    };

    if (!isNew) {
      output.changes = entry.values;
      output.prev = prev;
    }

    this._results.push(output);
  };

  return docIndex;
};
