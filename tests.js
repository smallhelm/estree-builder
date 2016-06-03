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

  tt(e.string('blah'), '"blah"');
  tt(e.object({
    one: e.number(2),
    three: e['true']()
  }), '{"one": 2,"three": true}');
  tt(e.json([2, '3', true, false, null]), '[2, "3", true, false, null]');

  tt(e.json({
    one: [2, '3', true, false, null]
  }), '{"one": [2, "3", true, false, null]}');

  tt(e['==='](e.num(1), e.num(0)), '1 === 0');
  tt(e['&&'](e.num(1), e.num(0)), '1 && 0');
  tt(e['!'](e.num(0)), '!0');

  tt(e.nil(), 'undefined');
  tt(e['this'](), 'this');
  tt(e['='](e.id('a'), e.num(0)), 'a = 0');
  tt(e['+='](e.id('i'), e.num(2)), 'i += 2');

  tt(e['-'](e.num(1), e.num(2)), '1 - 2');
  tt(e['-'](e.num(1)), '-1');
  tt(e['+'](e.num(1e-5)), '+0.00001');
  tt(e['+'](e.num(1e-5), e.id('i')), '0.00001 + i');

  tt(e['++'](e.id('i')), 'i++');
  tt(e['--'](e.id('i')), 'i--');

  tt(e[';'](e['--'](e.id('i'))), 'i--;');

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
    e(';', e['++'](e.id('i')))
  ], 'e', [
    e(';', e['='](e.id('error'), e.id('e')))
  ], [
    e(';', e['++'](e.id('j')))
  ]), 'try {i++;} catch (e) {error = e;} finally {j++;}');

  tt(e('var', 'i'), 'var i;');
  tt(e('var', 'i', e.num(1.5)), 'var i = 1.5;');

  tt(e.fn(['a', 'b'], [
    e('return', e('+', e.id('a'), e.id('b')))
  ]), 'function (a, b) {return a + b;}');

  tt(e.fn(['a', 'b'], [
    e('return', e('+', e.id('a'), e.id('b')))
  ], 'add'), 'function add(a, b) {return a + b;}');

  tt(e('?', e('>', e.id('a'), e.num(0))),
    'a > 0 ? undefined : undefined'
  );

  tt(e('?', e('>', e.id('a'), e.num(0)),
        e.id('a')),
    'a > 0 ? a : undefined'
  );
  tt(e('?', e('>', e.id('a'), e.num(0)),
        e.id('a'),
        e.num(1)),
    'a > 0 ? a : 1'
  );

  tt(e('call', e.id('a'), []),
    'a()'
  );

  tt(e('call', e.id('a'), [e.num(1), e.num(2)]),
    'a(1, 2)'
  );

  tt(e('.', e.id('a'), e.id('b')), 'a.b');
  tt(e('.', e.id('a'), e.str('b')), 'a["b"]');
  tt(e('.', e.id('a'), e.num(1)), 'a[1]');

  tt(e('get', e.id('a'), e.id('b')), 'a[b]');
  tt(e('get', e.id('a'), e.str('b')), 'a["b"]');

  tt(e('..', e.id('a'), [e.num(1), e.id('b'), e.str('c')]), 'a[1][b]["c"]');

  t.end();
});
