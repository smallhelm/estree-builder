var e = require('./');
var test = require('tape');
var astring = require('astring');

test('basics', function(t){
  t.equals(astring(e.string('blah')), '"blah"');
  t.end();
});
