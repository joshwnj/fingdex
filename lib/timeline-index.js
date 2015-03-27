// TODO: as an optimisation we can initialize with the set of docs, rather than reading doc entries 1 by 1.  Only need to read doc entries for updates that come after our first catchup
// TODO: do leveldb batch operations

var Fingdex = require('../');
var levelup = require('levelup');

module.exports = function (docIndex, handlers) {
  handlers = handlers || {};

  // create a timeline of all events (inferred from docs)
  var timeline = new Fingdex(docIndex);

  // lookup of what events are currently in the db
  timeline._eventKeys = {};

  timeline.db = levelup('', {
    db: require('memdown'),
    keyEncoding: require('bytewise'),
    valueEncoding: 'json'
  });

  timeline.addEntry = function (entry) {
    var self = this;
    var type = entry.type;

    // ignore the doc if we don't have a handler for that type
    var handler = handlers[type];
    if (!handler) { return; }

    // extract relevant fields, based on doc type
    var fields = handler(entry);

    var docId = entry.id;
    var doc = docIndex.getDoc(docId);
    var changes = entry.isNew ? doc.values : entry.changes;
    var prev = entry.prev || {};

    var events = fields.map(function (field) {
      var ts = changes[field];
      var prevTs = prev[field];

      // ignore if there's no value
      if (ts === undefined) { return; }

      // ignore if the key already exists in the db
      if (self._eventKeys[createDbKey(ts, docId, field)] === true) { return; }

      return {
        ts: ts,
        prevTs: prevTs,
        docId: docId,
        docType: type,
        field: field
      };
    }).filter(Boolean);

    // add events to the result stream and udpate the db
    events.forEach(function (event) {
      self._results.push(event);

      // update the db
      self.updateDb(event);
    });
  };

  function createDbKey (ts, docId, field) {
    return [ts, docId, field];
  }

  timeline.updateDb = function (event) {
    // delete the old event
    if (event.prevTs !== undefined) {
      var prevKey = createDbKey(event.prevTs, event.docId, event.field);
      delete this._eventKeys[prevKey];
      this.db.del(prevKey);
    }

    // add the new event
    var key = createDbKey(event.ts, event.docId, event.field);
    this._eventKeys[key] = true;
    this.db.put(key, {
      ts: event.ts,
      type: event.docType,
      id: event.docId,
      field: event.field
    });
  };

  return timeline;
};
