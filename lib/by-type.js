'use strict';

let Fingdex = require('../');

module.exports = function indexByType (docIndex, type) {
  let index = new Fingdex(docIndex);
  index.ids = new Set();
  index.addEntry = function (entry) {
    // only update the index when a new doc is created and matches the type
    if (!entry.isNew) { return; }
    if (entry._type !== type) { return; }

    this.ids.add(entry._id);
  };
  return index;
};
