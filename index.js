var hasOwnProperty = Object.prototype.hasOwnProperty;
var has = function(obj, key){
  return obj != null && hasOwnProperty.call(obj, key);
};

var isObject = function(val){
  return !!val && (typeof val == 'object');
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

def(['object', 'obj'], function(pairs){
  return {
    type: 'ObjectExpression',
    properties: pairs.map(function(pair){
      return {
        type: 'Property',
        key: pair[0],
        value: pair[1],
        kind: 'init'
      };
    })
  };
});

e.json = function(val, loc){
  if(Array.isArray(val)){
    return e.array(val.map(function(elm){
      return e.json(elm, loc);
    }));
  }
  if(isObject(val)){
    return e.object(val, loc);
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
  return e['null']();
};
