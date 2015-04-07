'use strict';

function Teams () {
  this.teams = new Set();
  this.membersByTeam = new Map();
  this.teamsByMember = new Map();
  this.memberHoursByTeam = new Map();
}

Teams.prototype.addTeam = function (id) {
  this.teams.add(id);
};

Teams.prototype.removeTeam = function (teamId) {
  this.teams.delete(teamId);

  // remove all people from that team
  this.membersByTeam.get(teamId).values().forEach((personId) => this.removePersonFromTeam(personId, teamId));
  this.membersByTeam.delete(teamId);
  this.memberHoursByTeam.delete(teamId);
};

Teams.prototype.getTeams = function () {
  return Array.from(this.teams);
};

Teams.prototype.setHoursPerWeek = function(personId, teamId, hoursPerWeek) {
  let lookup = this.memberHoursByTeam.get(teamId);
  if (lookup === undefined) {
    lookup = new Map();
    this.memberHoursByTeam.set(teamId, lookup);
  }
  lookup.set(personId, hoursPerWeek);
};


Teams.prototype.addPersonToTeam = function(personId, teamId) {
  let members = this.membersByTeam.get(teamId);
  if (members === undefined) {
    members = new Set();
    this.membersByTeam.set(teamId, members);
  }
  members.add(personId);

  // ----

  let teams = this.teamsByMember.get(personId);
  if (teams === undefined) {
    teams = new Set();
    this.teamsByMember.set(personId, teams);
  }
  teams.add(teamId);
};

Teams.prototype.removePersonFromTeam = function(personId, teamId) {
  let members = this.membersByTeam.get(teamId);
  if (members !== undefined) {
    members.delete(personId);
    if (members.size === 0) {
      this.membersByTeam.delete(teamId);
    }
  }

  // ----

  let teams = this.teamsByMember.get(personId);
  if (teams !== undefined) {
    teams.delete(teamId);
    if (teams.size === 0) {
      this.teamsByMember.delete(personId);
    }
  }

  // ----

  this.setHoursPerWeek(personId, teamId, 0);
  this.memberHoursByTeam.get(teamId).delete(personId);
};

Teams.prototype.getAllPeople = function () {
  return this.teamsByMember.values().filter((person) => {
    let teams = this.teamsByMember.get(person);

    // only include this person if they're in at least 1 active team
    return teams.some(this.isTeamActive.bind(this));
  });
};

Teams.prototype.isTeamActive = function (teamId) {
  return this.teams.has(teamId);
};

module.exports = Teams;
