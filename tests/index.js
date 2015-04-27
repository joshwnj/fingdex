'use strict';

let tape = require('tape');
let Fingdex = require('../');

function createFakeSource () {
  let source = new Fingdex();
  var items = [];

  items.push({
    _cuid: 0,
    _id: 'pizza',
    _type: 'food',
    slices: 8
  });

  items.push({
    _cuid: 1,
    _id: 'donut',
    _type: 'food',
    slices: 2
  });

  items.push({
    _cuid: 2,
    _id: 'cat',
    _type: 'animal'
  });

  // make a fake source that emits some changes
  items.forEach(source.emitChange.bind(source));

  return source;
}

tape('Basic usage', function (t) {
  const source = createFakeSource();
  const docIndex = Fingdex.createDocIndex(source);

  t.equals(docIndex.getDoc('donut'), undefined, 'Doc index wont be populated until manual catchup');

  // who are we kidding, you can't really slice a donut
  source.emitChange({
    _cuid: 3,
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
