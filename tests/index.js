'use strict';

let tape = require('tape');
let Fingdex = require('../');
let indexByType = require('../lib/by-type');

tape('Basic usage', function (t) {
  let source = new Fingdex();
  let docIndex = require('../lib/doc-index')(source);

  source.addEntry({
    _id: 'pizza',
    _type: 'food',
    slices: 8
  });

  source.addEntry({
    _id: 'donut',
    _type: 'food',
    slices: 2
  });

  source.addEntry({
    _id: 'cat',
    _type: 'animal'
  });

  t.equals(docIndex.getDoc('donut'), undefined, 'Manual catchup by default');

  // who are we kidding, you can't really slice a donut
  source.addEntry({
    _id: 'donut',
    slices: 1
  });

  docIndex.catchup();
  t.equals(docIndex.getDoc('donut').slices, 1, 'Doc value matches the latest update');

  // create an index of foods
  let foods = indexByType(docIndex, 'food');
  foods.catchup();
  t.ok(foods.ids.has('donut'), 'Set includes food');
  t.ok(foods.ids.has('pizza'), 'Set includes food');
  t.ok(!foods.ids.has('cat'), 'Set doesn\'t include non-food docs');

  t.end();
});
