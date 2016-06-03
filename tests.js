var e = require('./');
var test = require('tape');
var astring = require('astring');

test('basics', function(t){
  t.equals(astring(e.string('blah')), '"blah"');
  t.equals(astring(e.object({
    one: e.number(2),
    three: e['true']()
  })), '{\n\t"one": 2,\n\t"three": true\n}');
  t.equals(astring(e.json([2, '3', true, false, null])), '[2, "3", true, false, null]');

  t.equals(astring(e.json({
    one: [2, '3', true, false, null]
  })), '{\n\t"one": [2, "3", true, false, null]\n}');

  t.equals(astring(e['==='](e.num(1), e.num(0))), '1 === 0');
  t.equals(astring(e['&&'](e.num(1), e.num(0))), '1 && 0');
  t.equals(astring(e['!'](e.num(0))), '!0');

  t.equals(astring(e.nil()), 'undefined');
  t.equals(astring(e['this']()), 'this');
  t.equals(astring(e['='](e.id('a'), e.num(0))), 'a = 0');
  t.equals(astring(e['+='](e.id('i'), e.num(2))), 'i += 2');

  t.equals(astring(e['-'](e.num(1), e.num(2))), '1 - 2');
  t.equals(astring(e['-'](e.num(1))), '-1');
  t.equals(astring(e['+'](e.num(1e-5))), '+0.00001');
  t.equals(astring(e['+'](e.num(1e-5), e.id('i'))), '0.00001 + i');

  t.end();
});
