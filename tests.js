var e = require('./');
var test = require('tape');
var astring = require('astring');

test('basics', function(t){
  t.equals(astring(e.string('blah')), '"blah"');
  t.equals(astring(e.json([2, '3', true, false, null])), '[2, "3", true, false, null]');
  t.end();
});
