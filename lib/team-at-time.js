'use strict';

var Fingdex = require('./fingdex');
var Teams = require('./team-aggregator');

module.exports = function (docIndex, timelineIndex) {
  var index = new Fingdex(timelineIndex);
  index.teams = new Teams();

  index.addEntry = function (event) {
    this.processEvent(event);
  };

  index.processEvent = function (event) {
    var doc = docIndex.getDoc(event.id);

    switch (doc.type) {
    case 'team':
      switch (event.field) {
      case 'startedAt':
        this.teams.addTeam(doc.id);
        break;

      case 'endedAt':
        this.temas.removeTeam(doc.id);
        break;

      default:
        console.error('Unknown field:', event.field);
        break;
      }
      break;

    case 'teamMembership':
      switch (event.field) {
      case 'startedAt':
        this.teams.addPersonToTeam(doc.values.person, doc.values.team);
        this.teams.setHoursPerWeek(doc.values.person, doc.values.team, doc.values.hoursPerWeek);
        break;

      case 'endedAt':
        this.teams.removePersonFromTeam(doc.values.person, doc.values.team);
        break;

      default:
        console.error('Unknown field:', event.field);
        break;
      }
      break;

    default:
      console.error('Unknown event:', event);
      break;
    }
  };

  return index;
};
