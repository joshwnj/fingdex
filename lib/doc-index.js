'use strict';

const Fingdex = require('../');
const createIndexByType = require('./by-type');

module.exports = function (sourceIndex, docDefaults) {
  docDefaults = docDefaults || {};

  const docIndex = new Fingdex(sourceIndex);

  docIndex.createIndexByType = createIndexByType.bind(null, docIndex);

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

  docIndex.through = function (entry) {
    var cuid = this._lastCuid = entry._cuid;

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

    // emit changes to docs
    var output = this.formatEmit(id);
    output._cuid = cuid;

    if (!isNew) {
      output.changes = entry;
      output.prev = prev;
    }

    this.emitChange(output);
  };

  docIndex.formatEmit = function (id) {
    var doc = this.getDoc(id);
    return {
      isNew: true,
      _id: id,
      _type: doc._type
    };
  };

  docIndex.getSnapshot = function () {
    return {
      lastCuid: this._lastCuid,
      docs: this.docs
    };
  };

  return docIndex;
};
