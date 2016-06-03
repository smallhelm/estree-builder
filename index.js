var hasOwnProperty = Object.prototype.hasOwnProperty;
var has = function(obj, key){
  return obj != null && hasOwnProperty.call(obj, key);
};

var isObject = function(val){
  return !!val && (typeof val == 'object');
};

var mapValues = function(obj, fn){
  var n_obj = {};
  for(key in obj){
    if(has(obj, key)){
      n_obj[key] = fn(obj[key], key, obj);
    }
  }
  return n_obj;
};

var isLocationNode = function(loc){
  return loc && has(loc, 'start') && has(loc, 'end');
};

////////////////////////////////////////////////////////////////////////////////

var e = module.exports = {};

var def = function(names, builder){
  if(typeof names === 'string'){
    names = [names];
  }
  var fn = function(){
    var args = Array.prototype.slice.call(arguments);
    var loc;
    if(isLocationNode(args.unshift())){
      loc = args.unshift();
      args = args.slice(0, -1);
    }
    var node = builder.apply(null, args);
    if(loc){
      node.loc = loc;
      if(loc.source && node.type === 'Literal'){
        node.raw = loc.source;
      }
    }
    return node;
  };
  names.forEach(function(name){
    e[name] = fn;
  });
};

def(['string', 'str', 'number', 'num', 'float'], function(val){
  return {
    'type': 'Literal',
    'value': val
  };
});

def('null', function(){
  return {
    'type': 'Literal',
    'value': null
  };
});

def('true', function(){
  return {
    'type': 'Literal',
    'value': true
  };
});

def('false', function(){
  return {
    'type': 'Literal',
    'value': false
  };
});

def(['array', 'arr'], function(elements){
  return {
    type: 'ArrayExpression',
    elements: elements
  };
});

def(['object', 'obj'], function(obj){
  var pairs = [];
  for(key in obj){
    if(has(obj, key)){
      pairs.push({
        type: 'Property',
        key: e.string(key),
        value: obj[key],
        kind: 'init'
      });
    }
  }
  return {
    type: 'ObjectExpression',
    properties: pairs
  };
});

e.json = function(val, loc){
  if(Array.isArray(val)){
    return e.array(val.map(function(elm){
      return e.json(elm, loc);
    }));
  }
  if(isObject(val)){
    return e.object(mapValues(val, function(elm){
      return e.json(elm, loc);
    }), loc);
  }
  if(val === true || val === false){
    return e[val ? 'true' : 'false'](loc);
  }
  if(typeof val === 'string'){
    return e.string(val, loc);
  }
  if(typeof val === 'number'){
    return e.number(val, loc);
  }
  return e['null'](loc);
};

var defJSOperator = function(type, operator){
  def(operator, function(left, right){
    return {
      type: type,
      operator: operator,
      left: left,
      right: right
    };
  });
};

[
  "==", "!=", "===", "!==",
  "<", "<=", ">", ">=",
  "<<", ">>", ">>>",
  "*", "/", "%",
  "|", "^", "&", "in",
  "instanceof"
].forEach(function(operator){
  defJSOperator("BinaryExpression", operator);
});

["&&", "||"].forEach(function(operator){
  defJSOperator("LogicalExpression", operator);
});

["!", "~", "typeof", "void", "delete"].forEach(function(operator){
  def(operator, function(arg){
    return {
      type: "UnaryExpression",
      prefix: true,
      operator: operator,
      argument: arg
    };
  });
});

["+", "-"].forEach(function(operator){
  def(operator, function(a, b){
    if(arguments.length === 1){
      return {
        type: "UnaryExpression",
        prefix: true,
        operator: operator,
        argument: a
      };
    }
    return {
      type: "BinaryExpression",
      operator: operator,
      left: a,
      right: b
    };
  });
});

[
  "=", "+=", "-=", "*=", "/=", "%=",
 "<<=", ">>=", ">>>=",
 "|=", "^=", "&="
].forEach(function(op){
  def(op, function(left, right){
    return {
      type: 'AssignmentExpression',
      operator: op,
      left: left,
      right: right
    };
  });
});

["++", "--"].forEach(function(op){
  def(op, function(arg){
    return {
      type: 'UpdateExpression',
      operator: op,
      argument: arg,
      prefix: false
    };
  });
});

def(['identifier', 'id'], function(name){
  return {
    type: 'Identifier',
    name: name
  };
});

def(['undefined', 'nil'], function(){
  return e.id('undefined');
});

def(['arguments', 'args'], function(){
  return e.id('arguments');
});

def('this', function(){
  return {
    type: 'ThisExpression'
  };
});

def(['statement', ';'], function(expr){
  return {
    type: 'ExpressionStatement',
    expression: expr
  };
});

def('block', function(body){
  return {
    type: 'BlockStatement',
    body: body
  };
});

def('return', function(arg){
  return {
    type: 'ReturnStatement',
    argument: arg
  };
});

def('if', function(test, consequent, alternate){
  return {
    type: 'IfStatement',
    test: test,
    consequent: consequent,
    alternate: alternate
  };
});

def('throw', function(arg){
  return {
    type: 'ThrowStatement',
    argument: arg
  };
});

def('try', function(body, catch_var, catch_stmt, finally_stmt){
  return {
    type: 'TryStatement',
    block: e.block(body),
    handler: {
      type: 'CatchClause',
      param: e.id(catch_var || 'error'),
      body: e.block(catch_stmt)
    },
    finalizer: e.block(finally_stmt)
  };
});

def('new', function(callee, args){
  return {
    type: 'NewExpression',
    callee: callee,
    'arguments': args
  };
});

def('var', function(name, val){
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: e.id(name),
        init: val
      }
    ]
  };
});

def(['function', 'fn', 'lambda'], function(args, body, id){
  return {
    type: 'FunctionExpression',
    id: typeof id === 'string' ? e.id(id) : undefined,
    params: args.map(function(arg){
      return e.id(arg);
    }),
    body: e.block(body)
  };
});
