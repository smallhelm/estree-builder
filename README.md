# estree-builder

[![build status](https://secure.travis-ci.org/smallhelm/estree-builder.svg)](https://travis-ci.org/smallhelm/estree-builder)
[![dependency status](https://david-dm.org/smallhelm/estree-builder.svg)](https://david-dm.org/smallhelm/estree-builder)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Handy functions for building [estree](https://github.com/estree/estree/blob/master/spec.md) nodes

## Example

```js
var e = require('estree-builder')

var estree = e.number(1)
// -> { type: 'Literal', value: 1 }

//let's use astring to convert the estree into js code
var astring = require('astring').generate

astring(estree)
// -> '1'

estree = e.fn(['a', 'b'], [
  e('return', e('+', e.id('a'), e.id('b')))
], 'add')

astring(estree)
// -> 'function add(a, b) {return a + b}'
```

## Usage
There are 3 ways to call a builder
```js
e.number(1)
e['number'](1)
e('number', 1)
```
All builders can take a `location` object as the last argument. (i.e. for generating source maps)
```js
var loc = {
  source: "some-file.js"
  start: { line: 1, column: 0 },
  end: { line: 1, column: 1 }
}

e('number', 1, loc)
```

## List of builders

[//]: # (GEN-DOCS-BEGIN)

### building block values

```js
e('number', val) //aliases: 'num', 'float'
e('string', val) //aliases: 'str'
e('true')
e('false')
e('null')
e('undefined') //aliases: 'nil'
e('array', elements) //aliases: 'arr'
e('object-raw', pairs) //aliases: 'obj-raw'
e('object-property', key, value) //aliases: 'obj-prop'
e('object', obj) //aliases: 'obj'
```

### given some json object, build the tree

```js
e('json', val)
```

### variables

```js
e('var', id, val)
e('let', id, val)
e('const', id, val)
e('identifier', name) //aliases: 'id'
```

### control flow

```js
e('if', test, consequent, alternate)
e('ternary', test, consequent, alternate) //aliases: '?'
e('switch', discriminant, cases)
e('case', test, consequent)
e('default', consequent)
e('while', test, body)
e('for', init, test, update, body)
e('for-in', left, right, body)
e('for-of', left, right, body)
e('break')
e('continue')
e('return', arg)
e('throw', arg)
e('try', body, catchVar, catchStmt, finallyStmt)
```

### functions

```js
e('function', args, body, id) //aliases: 'fn', 'lambda'
e('call', callee, args)
e('arrow', args, body)
```

### property access

```js
e('.', obj, prop)
e('get', obj, prop)
e('get-in', obj, path) //aliases: '..'
```

### language stuff

```js
e('arguments') //aliases: 'args'
e('this')
e('statement', expr) //aliases: ';'
e('block', body)
e('new', callee, args)
```

### infix operators

```js
e('==', left, right)
e('!=', left, right)
e('===', left, right)
e('!==', left, right)
e('<', left, right)
e('<=', left, right)
e('>', left, right)
e('>=', left, right)
e('<<', left, right)
e('>>', left, right)
e('>>>', left, right)
e('*', left, right)
e('/', left, right)
e('%', left, right)
e('|', left, right)
e('^', left, right)
e('&', left, right)
e('in', left, right)
e('instanceof', left, right)
e('&&', left, right)
e('||', left, right)
e('+', a, b)
e('-', a, b)
```

### unary operators

```js
e('!', arg)
e('~', arg)
e('typeof', arg)
e('void', arg)
e('delete', arg)
e('++', arg)
e('--', arg)
```

### assignments

```js
e('=', left, right)
e('+=', left, right)
e('-=', left, right)
e('*=', left, right)
e('/=', left, right)
e('%=', left, right)
e('<<=', left, right)
e('>>=', left, right)
e('>>>=', left, right)
e('|=', left, right)
e('^=', left, right)
e('&=', left, right)
```

### destructuring

```js
e('assign', left, right)
e('assign-property', key, value) //aliases: 'assign-prop'
e('obj-pattern', properties)
e('arr-pattern', elements)
```

### generator functions

```js
e('genfn', args, body, id)
e('yield', arg, delegate)
```

### classes

```js
e('class', name, superClass, methods)
e('method', key, value, kind, computed, isStatic)
```

[//]: # (GEN-DOCS-END)

## Contributing

Add tests to tests.js, run them like this:
```sh
$ npm test
```
or to automatically re-run them whenever you make a change
```sh
$ npm start
```

Re-generate the docs (README.md between the GEN-DOCS-BEGIN|END comments)
```sh
$ npm run build
```

## License
MIT
