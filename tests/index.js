'use strict';

let tape = require('tape');
let Fingdex = require('../');

tape('Basic usage', function (t) {
  let source = new Fingdex();
  let docIndex = Fingdex.createDocIndex(source);

  var items = [];

  items.push({
    _id: 'pizza',
    _type: 'food',
    slices: 8
  });

  items.push({
    _id: 'donut',
    _type: 'food',
    slices: 2
  });

  items.push({
    _id: 'cat',
    _type: 'animal'
  });

  items.forEach(source.append.bind(source));

  t.equals(docIndex.getDoc('donut'), undefined, 'Doc index wont be populated until manual catchup');

  // who are we kidding, you can't really slice a donut
  source.append({
    _id: 'donut',
    slices: 1
  });

  docIndex.catchup();
  t.equals(docIndex.getDoc('donut').slices, 1, 'Doc value matches the latest update');

  // create an index of foods
  let foods = docIndex.createIndexByType('food');
  foods.catchup();
  t.ok(foods.ids.has('donut'), 'Set includes food');
  t.ok(foods.ids.has('pizza'), 'Set includes food');
  t.ok(!foods.ids.has('cat'), 'Set doesnt include non-food docs');

  t.end();
});
