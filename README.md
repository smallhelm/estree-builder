# estree-builder

[![build status](https://secure.travis-ci.org/smallhelm/estree-builder.svg)](https://travis-ci.org/smallhelm/estree-builder)
[![dependency status](https://david-dm.org/smallhelm/estree-builder.svg)](https://david-dm.org/smallhelm/estree-builder)

Handy functions for building estree nodes

## Example

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
  source: "1"
  start: { line: 1, column: 0 },
  end: { line: 1, column: 1 }
};

e('number', 1, loc)
```

## List of builders

### building block values

```js
e('number', val) //aliases: 'num', 'float'
e('string', val) //aliases: 'str'
e('true')
e('false')
e('null')
e('undefined') //aliases: 'nil'
e('array', elements) //aliases: 'arr'
e('object', obj) //aliases: 'obj'
```

### given some json object, build the tree

```js
e('json', val)
```

### variables

```js
e('var', name, val)
e('identifier', name) //aliases: 'id'
```

### control flow

```js
e('if', test, consequent, alternate)
e('ternary', test, consequent, alternate) //aliases: '?'
e('return', arg)
e('throw', arg)
e('try', body, catch_var, catch_stmt, finally_stmt)
```

### functions

```js
e('function', args, body, id) //aliases: 'fn', 'lambda'
e('call', callee, args)
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

## License
MIT
