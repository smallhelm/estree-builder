var hasOwnProperty = Object.prototype.hasOwnProperty

var has = function (obj, key) {
  return obj != null && hasOwnProperty.call(obj, key)
}

var isObject = function (val) {
  return !!val && (typeof val === 'object')
}

var strToID = function (v, loc) {
  if (typeof v === 'string') {
    return e('id', v, loc)
  }
  return v
}

var mapValues = function (obj, fn) {
  var nObj = {}
  for (var key in obj) {
    if (has(obj, key)) {
      nObj[key] = fn(obj[key], key, obj)
    }
  }
  return nObj
}

var isLocationNode = function (loc) {
  return loc && has(loc, 'start') && has(loc, 'end')
}

var defJSOperator = function (type, operator) {
  def(operator, function (left, right) {
    return {
      type: type,
      operator: operator,
      left: left,
      right: right
    }
  })
}

var printDocs = (process && process.env && process.env.PRINT_DOCS) === 'true'

var docsSection = function (sectionName) {
  if (!printDocs) return
  console.log('```')
  console.log()
  console.log('### ' + sectionName)
  console.log()
  console.log('```js')
}

var docsFn = function (names, builder) {
  if (!printDocs) return
  var parsedArgs = /^function \(([^)]*)\)/.exec(builder.toString())
  var argNames = parsedArgs[1].split(',').map(function (arg) {
    return arg.trim()
  }).filter(function (arg) {
    return arg.length > 0
  })

  var docArgs = ["'" + names[0] + "'"].concat(argNames)

  var aliases = ''
  if (names.length > 1) {
    aliases = ' //aliases: '
    aliases += names.slice(1).map(function (a) {
      return "'" + a + "'"
    }).join(', ')
  }

  console.log('e(' + docArgs.join(', ') + ')' + aliases)
}

/// /////////////////////////////////////////////////////////////////////////////

var e = module.exports = function () {
  var args = Array.prototype.slice.call(arguments)
  return e[args[0]].apply(null, args.slice(1))
}

var def = function (names, builder) {
  if (typeof names === 'string') {
    names = [names]
  }
  docsFn(names, builder)
  var fn = function () {
    var args = Array.prototype.slice.call(arguments)
    var loc
    if (isLocationNode(args[args.length - 1])) {
      loc = args[args.length - 1]
      args = args.slice(0, -1)
    }
    var node = builder.apply({ loc: loc }, args)
    if (loc) {
      node.loc = loc
    }
    return node
  }
  names.forEach(function (name) {
    e[name] = fn
  })
}

docsSection('building block values')

def(['number', 'num', 'float'], function (val) {
  return {
    'type': 'Literal',
    'value': val
  }
})

def(['string', 'str'], function (val) {
  return {
    'type': 'Literal',
    'value': val
  }
})

def('true', function () {
  return {
    'type': 'Literal',
    'value': true
  }
})

def('false', function () {
  return {
    'type': 'Literal',
    'value': false
  }
})

def('null', function () {
  return {
    'type': 'Literal',
    'value': null
  }
})

def(['undefined', 'nil'], function () {
  return e('id', 'undefined', this.loc)
})

def(['array', 'arr'], function (elements) {
  return {
    type: 'ArrayExpression',
    elements: elements
  }
})

def(['object-raw', 'obj-raw'], function (pairs) {
  return {
    type: 'ObjectExpression',
    properties: pairs
  }
})

def(['object-property', 'obj-prop'], function (key, value) {
  return {
    type: 'Property',
    key: key,
    value: value,
    kind: 'init'
  }
})

def(['object', 'obj'], function (obj) {
  var pairs = []
  for (var key in obj) {
    if (has(obj, key)) {
      pairs.push(e('object-property', e.string(key), obj[key]))
    }
  }
  return {
    type: 'ObjectExpression',
    properties: pairs
  }
})

docsSection('given some json object, build the tree')

docsFn(['json'], function (val) {})
e.json = function (val, loc) {
  if (Array.isArray(val)) {
    return e.array(val.map(function (elm) {
      return e.json(elm, loc)
    }))
  }
  if (isObject(val)) {
    return e.object(mapValues(val, function (elm) {
      if (typeof elm === 'number' && elm < 0) {
        return e('-', e.number(Math.abs(elm)))
      } else {
        return e.json(elm, loc)
      }
    }), loc)
  }
  if (val === true || val === false) {
    return e[val ? 'true' : 'false'](loc)
  }
  if (typeof val === 'string') {
    return e.string(val, loc)
  }
  if (typeof val === 'number') {
    return e.number(val, loc)
  }
  return e['null'](loc)
}

docsSection('variables')

function varDec (kind) {
  return function (id, val) {
    return {
      type: 'VariableDeclaration',
      kind: kind,
      declarations: [
        {
          loc: this.loc,
          type: 'VariableDeclarator',
          id: strToID(id, this.loc),
          init: val
        }
      ]
    }
  }
};

def('var', varDec('var'))
def('let', varDec('let'))
def('const', varDec('const'))

def(['identifier', 'id'], function (name) {
  if (name.indexOf('.') >= 0) {
    var parts = name.split('.')
    var curr = e('id', parts[0], this.loc)
    var i = 1
    while (i < parts.length) {
      curr = e('.', curr, e('id', parts[i], this.loc), this.loc)
      i++
    }
    return curr
  }
  return {
    type: 'Identifier',
    name: name
  }
})

docsSection('control flow')

def('if', function (test, consequent, alternate) {
  return {
    type: 'IfStatement',
    test: test,
    consequent: consequent,
    alternate: alternate
  }
})

def(['ternary', '?'], function (test, consequent, alternate) {
  return {
    type: 'ConditionalExpression',
    test: test,
    consequent: consequent || e.nil(),
    alternate: alternate || e.nil()
  }
})

def('switch', function (discriminant, cases) {
  return {
    type: 'SwitchStatement',
    discriminant: discriminant || e.nil(),
    cases: cases || []
  }
})

def('case', function (test, consequent) {
  return {
    type: 'SwitchCase',
    test: test,
    consequent: consequent || []
  }
})

def('default', function (consequent) {
  return {
    type: 'SwitchCase',
    consequent: consequent
  }
})

def('while', function (test, body) {
  return {
    type: 'WhileStatement',
    test: test,
    body: body
  }
})

def('for', function (init, test, update, body) {
  return {
    type: 'ForStatement',
    init: init,
    test: test,
    update: update,
    body: body
  }
})

def('for-in', function (left, right, body) {
  return {
    type: 'ForInStatement',
    left: left,
    right: right,
    body: body
  }
})

def('for-of', function (left, right, body) {
  return {
    type: 'ForOfStatement',
    left: left,
    right: right,
    body: body
  }
})

def('break', function () {
  return {
    type: 'BreakStatement'
  }
})

def('continue', function () {
  return {
    type: 'ContinueStatement'
  }
})

def('return', function (arg) {
  return {
    type: 'ReturnStatement',
    argument: arg
  }
})

def('throw', function (arg) {
  return {
    type: 'ThrowStatement',
    argument: arg
  }
})

def('try', function (body, catchVar, catchStmt, finallyStmt) {
  catchVar = catchVar || 'error'
  return {
    type: 'TryStatement',
    block: e.block(body, this.loc),
    handler: {
      type: 'CatchClause',
      param: strToID(catchVar, this.loc),
      body: e.block(catchStmt, this.loc)
    },
    finalizer: e.block(finallyStmt, this.loc)
  }
})

docsSection('functions')

def(['function', 'fn', 'lambda'], function (args, body, id) {
  var loc = this.loc
  return {
    type: 'FunctionExpression',
    id: strToID(id, loc),
    params: args.map(function (arg) {
      return strToID(arg, loc)
    }),
    body: e.block(body, loc)
  }
})

def('call', function (callee, args) {
  return {
    type: 'CallExpression',
    callee: callee,
    'arguments': args
  }
})

def(['arrow'], function (args, body) {
  var loc = this.loc
  return {
    type: 'ArrowFunctionExpression',
    params: args.map(function (arg) {
      return strToID(arg, loc)
    }),
    body: e.block(body, loc)
  }
})

docsSection('property access')

def('.', function (obj, prop) {
  return {
    type: 'MemberExpression',
    object: obj,
    property: prop,
    computed: prop.type !== 'Identifier'
  }
})

def('get', function (obj, prop) {
  return {
    type: 'MemberExpression',
    object: obj,
    property: prop,
    computed: true
  }
})

def(['get-in', '..'], function (obj, path) {
  var loc = this.loc
  var cur = obj
  path.forEach(function (part) {
    cur = e.get(cur, part, loc)
  })
  return cur
})

docsSection('language stuff')

def(['arguments', 'args'], function () {
  return e('id', 'arguments', this.loc)
})

def('this', function () {
  return {
    type: 'ThisExpression'
  }
})

def(['statement', ';'], function (expr) {
  return {
    type: 'ExpressionStatement',
    expression: expr
  }
})

def('block', function (body) {
  if (body &&
      has(body, 'type') &&
      has(body, 'body') &&
      body.type === 'BlockStatement') {
    // prevent nested BlockStatements
    return body
  }
  return {
    type: 'BlockStatement',
    body: body
  }
})

def('new', function (callee, args) {
  return {
    type: 'NewExpression',
    callee: callee,
    'arguments': args
  }
})

docsSection('infix operators');

[
  '==', '!=', '===', '!==',
  '<', '<=', '>', '>=',
  '<<', '>>', '>>>',
  '*', '/', '%',
  '|', '^', '&', 'in',
  'instanceof'
].forEach(function (operator) {
  defJSOperator('BinaryExpression', operator)
});

['&&', '||'].forEach(function (operator) {
  defJSOperator('LogicalExpression', operator)
});

['+', '-'].forEach(function (operator) {
  def(operator, function (a, b) {
    if (arguments.length === 1) {
      return {
        type: 'UnaryExpression',
        prefix: true,
        operator: operator,
        argument: a
      }
    }
    return {
      type: 'BinaryExpression',
      operator: operator,
      left: a,
      right: b
    }
  })
})

docsSection('unary operators');

['!', '~', 'typeof', 'void', 'delete'].forEach(function (operator) {
  def(operator, function (arg) {
    return {
      type: 'UnaryExpression',
      prefix: true,
      operator: operator,
      argument: arg
    }
  })
});

['++', '--'].forEach(function (op) {
  def(op, function (arg) {
    return {
      type: 'UpdateExpression',
      operator: op,
      argument: arg,
      prefix: false
    }
  })
})

docsSection('assignments');

[
  '=', '+=', '-=', '*=', '/=', '%=',
  '<<=', '>>=', '>>>=',
  '|=', '^=', '&='
].forEach(function (op) {
  def(op, function (left, right) {
    return {
      type: 'AssignmentExpression',
      operator: op,
      left: left,
      right: right
    }
  })
})

docsSection('destructuring')

def('assign', function (left, right) {
  return {
    type: 'AssignmentPattern',
    left: left,
    right: right
  }
})

def(['assign-property', 'assign-prop'], function (key, value) {
  key = strToID(key, this.loc)
  value = strToID(value, this.loc)
  var idName = function (id) {
    if (id && id.type === 'Identifier') {
      return id.name
    }
  }
  return {
    type: 'Property',
    key: key,
    value: value,
    shorthand: idName(key) === idName(value),
    kind: 'init',
    method: false,
    computed: false
  }
})

def('obj-pattern', function (properties) {
  var loc = this.loc
  return {
    type: 'ObjectPattern',
    properties: Array.isArray(properties)
      ? properties.map(function (p) {
        p = strToID(p, loc)
        if (p.type === 'Identifier') {
          p = {
            type: 'Property',
            key: p,
            value: p,
            kind: 'init',
            method: false,
            computed: false,
            shorthand: true
          }
        }
        return p
      })
      : properties
  }
})

def('arr-pattern', function (elements) {
  return {
    type: 'ArrayPattern',
    elements: elements
  }
})

docsSection('generator functions')

def('genfn', function (args, body, id) {
  var estree = e('function', args, body, id, this.loc)
  estree.generator = true
  return estree
})

def('yield', function (arg, delegate) {
  return {
    type: 'YieldExpression',
    argument: arg,
    delegate: !!delegate
  }
})

docsSection('classes')

def('class', function (name, superClass, methods) {
  return {
    type: 'ClassDeclaration',
    id: e('id', name, this.loc),
    superClass: strToID(superClass, this.loc),
    body: {
      type: 'ClassBody',
      body: methods || []
    }
  }
})

def('method', function (key, value, kind, computed, isStatic) {
  return {
    type: 'MethodDefinition',
    key: e('id', key, this.loc),
    value: value,
    kind: kind || 'method',
    computed: !!computed,
    static: !!isStatic
  }
})
