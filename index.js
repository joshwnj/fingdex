'use strict';

var Fingdex = require('./lib/fingdex');

// ----
// create a source for log entries

var sourceIndex = new Fingdex();
require('./entries').forEach(sourceIndex.addEntry.bind(sourceIndex));

// ----
// create an index that will aggregate entries into docs

var docIndex = require('./lib/doc-index')(sourceIndex);

// ----
// create an index that infer a timeline of events from docs

var timelineIndex = require('./lib/timeline-index')(docIndex);

// ----

var handlers = {};
handlers.team = (event) => {
  var doc = docIndex.getDoc(event.id) || {};
  var teamName = doc.values.name || event.id;

  switch (event.field) {
  case 'startedAt':
    console.log('%d: %s started', event.ts, teamName);
    break;

  case 'endedAt':
    console.log('%d: %s ended', event.ts, teamName);
    break;
  }
};

handlers.teamMembership = (event) => {
  var doc = docIndex.getDoc(event.id);
  var teamDoc = docIndex.getDoc(doc.values.team) || {};
  var personDoc = docIndex.getDoc(doc.values.person) || {};

  var teamName = teamDoc.values.name || doc.values.team;
  var personName = personDoc.values.name || doc.values.person;

  switch (event.field) {
  case 'startedAt':
    console.log('%d: %s joined the %s team', event.ts, personName, teamName);
    break;

  case 'endedAt':
    console.log('%d: %s left the %s team', event.ts, personName, teamName);
    break;
  }
};

timelineIndex.catchup();
// console.log('DOCS', docIndex.docs);
// console.log('TIMELINE EVENTS', timelineIndex._results);
// console.log('DB');

function showTeamAtTime (teamId, now, cb) {
  var teamsAtTime = require('./lib/team-at-time')(docIndex, timelineIndex);
  timelineIndex.db.readStream({
    keys: false,
    lt: [now]
  })
    .on('data', event => teamsAtTime.processEvent(event))
    .on('close', () => {
      var hours = teamsAtTime.teams.memberHoursByTeam.get(teamId);
      var totalHours = Array.from(hours.values()).reduce((acc, val) => acc + val, 0);

      console.log('\nWho is in the %s team @ %d?\n', teamId, now, Array.from(teamsAtTime.teams.membersByTeam.get(teamId)));
      console.log('Total dev hours per week: %d\n', totalHours, Array.from(hours));

      if (cb) { cb(); }
    });
}

function showTimeline (cb) {
  console.log('\nTimeline:');
  timelineIndex.db.readStream({
    keys: false,
    lt: [200]
  })
    .on('data', (event) => handlers[event.type](event))
    .on('error', console.error)
    .on('close', cb);
}

showTimeline(function () {
  var teamId = 'Gamecrate';
  console.log('\nInfo about gamecrate:', docIndex.getDoc(teamId));

  showTeamAtTime(teamId, 21, function () {
    showTeamAtTime(teamId, 101);
  });
});
