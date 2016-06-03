var hasOwnProperty = Object.prototype.hasOwnProperty;
var has = function(obj, key){
  return obj != null && hasOwnProperty.call(obj, key);
};

var isLocationNode = function(loc){
  return loc && has(loc, 'start') && has(loc, 'end');
};

////////////////////////////////////////////////////////////////////////////////

var e = {};

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

def(['string', 'str'], function(val){
  return {
    'type': 'Literal',
    'value': val//string | boolean | null | number
  };
});

module.exports = e;
