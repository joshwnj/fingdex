'use strict';

function createId (a) {
  return a.replace(/\W+/g, '');
}

function team (values) {
  var id = createId(values.name);

  return {
    id: id,
    type: 'team',
    values: values
  };
}

function person (values) {
  var id = createId(values.name);

  return {
    id: id,
    type: 'person',
    values: values
  };
}

function teamMembership (values) {
  var type = 'teamMembership';
  var id = [type, values.team, values.person].join('-');

  return {
    id: id,
    type: type,
    values: values
  };
}

// ----
var entries = [];

// ----
function addTeam (teamDoc, members) {
  entries.push(teamDoc);

  members.forEach(function (personDoc) {
    entries.push(personDoc);

    entries.push(teamMembership({
      team: teamDoc.id,
      person: personDoc.id
    }));
  });
}

// ----
// Team: black mountain

addTeam(
  team({
    name: 'Black Mountain Systems'
  }),
  [
    person({
      name: 'Alex Almada',
      email: 'alex.almada@x-team.com'
    })
  ]
);

// project got pushed back to start later
entries.push({
  id: 'BlackMountainSystems',
  type: 'team',
  values: {
    startedAt: 25,
    endedAt: 110
  }
});

// ----
// Team: tumbleplay

addTeam(
  team({
    name: 'Tumbleplay'
  }),
  [
    person({
      name: 'Luis Fonseca',
      email: 'luis@x-team.com'
    })
  ]
);

// ----
// Team: gamecrate


addTeam(
  team({
    name: 'Gamecrate',
    client: 'Newegg'
  }),
  [
    person({
      name: 'Gerald Villorente',
      email: 'gerald@x-team.com'
    }),

    person({
      name: 'Paul De Paula',
      email: 'paul@x-team.com'
    }),

    person({
      name: 'Roald Umandal',
      email: 'roald@.umandal@x-team.com',
      introVideo: 'http://www.youtube.com/watch?v=6mxDCHqsZfk&authuser=0'
    }),

    person({
      name: 'Ruthie Borces',
      email: 'ruthie.borcesx-team.com',
      introVideo: 'https://www.youtube.com/watch?v=_GFq4GYQAH0&authuser=0'
    })
  ]
);

// ruthie joined the team part time, after the others
entries.push({
  id: 'teamMembership-Gamecrate-RuthieBorces',
  type: 'teamMembership',
  values: {
    startedAt: 20,
    endedAt: 60,
    hoursPerWeek: 10
  }
});


// gerald went part-time
entries.push({
  id: 'teamMembership-Gamecrate-GeraldVillorente',
  type: 'teamMembership',
  values: {
    startedAt: 0,
    endedAt: 100
  }
});

entries.push({
  id: 'teamMembership-Gamecrate-GeraldVillorente-1',
  type: 'teamMembership',
  values: {
    team: 'Gamecrate',
    person: 'GeraldVillorente',
    startedAt: 100,
    hoursPerWeek: 25
  }
});


// // ----
// // Team: sim general


// entries.push(team({
//   name: 'Sim General'
// }));

// entries.push(person({
//   name: 'Hugo Ruivo',
//   email: 'hugo@x-team.com'
// }));

// entries.push(teamMembership({
//   person: 'HugoRuivo',
//   team: 'SimGeneral'
// }));

// entries.push(person({
//   name: 'RicardoAguiar',
//   email: 'ricardo@x-team.com'
// }));

// entries.push(teamMembership({
//   person: 'RicardoAguiar',
//   team: 'SimGeneral'
// }));

// // ----
// // Gamecrate ends

// entries.push({
//   id: 'Gamecrate',
//   type: 'team',
//   values: {
//     endedAt: 50
//   }
// });

// // ----
// // Team: cambridge university

// entries.push({
//   id: 'cambridgeUniversity',
//   type: 'team',
//   values: {
//     name: 'Cambridge University'
//   }
// });

// entries.push({
//   id: 'vascoCosta',
//   type: 'person',
//   values: {
//     name: 'Vasco Costa',
//     email: 'vasco@x-team.com'
//   }
// });

// entries.push({
//   id: 'teamMembership-vascoCosta-cambridgeUniversity',
//   type: 'teamMembership',
//   values: {
//     person: 'vascoCosta',
//     team: 'cambridgeUniversity'
//   }
// });

module.exports = entries;
