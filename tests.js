var e = require('./');
var test = require('tape');
var astring = require('astring');

test('basics', function(t){
  var tt = function(est, expected){
    t.equals(astring(est, {
      indent: '',
      lineEnd: ''
    }), expected);
  };

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

  t.equals(astring(e['++'](e.id('i'))), 'i++');
  t.equals(astring(e['--'](e.id('i'))), 'i--');

  t.equals(astring(e[';'](e['--'](e.id('i')))), 'i--;');

  tt(e['return'](e.id('i')), 'return i;');

  tt(
    e['if'](e.id('cond'),
      e[';'](e['++'](e.id('i'))),
      e[';'](e['--'](e.id('i')))),
    'if (cond) i++; else i--;'
  );
  tt(
    e['if'](e.id('cond'),
      e[';'](e['++'](e.id('i')))),
    'if (cond) i++;'
  );

  tt(e['throw'](e['new'](e.id('Error'), [e.str('blah')])), 'throw new Error("blah");');

  tt(e['try'](), 'try {} catch (error) {} finally {}');
  tt(e['try']([
    e[';'](e['++'](e.id('i')))
  ], 'e', [
    e[';'](e['='](e.id('error'), e.id('e')))
  ], [
    e[';'](e['++'](e.id('j')))
  ]), 'try {i++;} catch (e) {error = e;} finally {j++;}');

  tt(e['var']('i'), 'var i;');
  tt(e['var']('i', e.num(1.5)), 'var i = 1.5;');

  tt(e.fn(['a', 'b'], [
    e['return'](e['+'](e.id('a'), e.id('b')))
  ]), 'function (a, b) {return a + b;}');

  tt(e.fn(['a', 'b'], [
    e['return'](e['+'](e.id('a'), e.id('b')))
  ], 'add'), 'function add(a, b) {return a + b;}');

  t.end();
});
