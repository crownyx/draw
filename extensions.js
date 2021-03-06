/////////////
// general //
/////////////

var isNum = function(num) {
  return typeof num === 'number' && !isNaN(num);
}

////////////
// Number //
////////////

if (!Number.prototype.round) {
  Object.defineProperty(Number.prototype, 'round', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(numDec) {
      if(this == null)
        throw new TypeError('Number.prototype.round called on null or undefined');
      var precision = Math.pow(10, numDec || 0);
      return Math.round(this * precision) / precision;
    }
  });
}

///////////
// Array //
///////////

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }
      }
      return undefined;
    }
  });
}

if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return i;
          }
        }
      }
      return -1;
    }
  });
}

Object.defineProperty(Array.prototype, 'findBy', {
  enumerable: false,
  configurable: true,
  writable: true,
  value: function(methodName) {
    if (this == null) {
      throw new TypeError('Array.prototype.findBy called on null or undefined');
    }
    var args = Array.prototype.slice.call(arguments, 1);
    return this.find(function(element) {
      return element[methodName].apply(element, args);
    });
  }
});

Array.prototype.remove = function(obj) {
  var index = this.indexOf(obj);
  if(index !== -1) this.splice(index, 1);
}

Array.prototype.flatten = function() {
  return(this.reduce(function(prev, curr) {
    return prev.concat(curr);
  }, []));
}

Array.prototype.flatMap = function(callback) {
  var mapped = this.map(callback, arguments[1]);
  return mapped.flatten();
}

Array.prototype.minBy = function() {
  var method = arguments[0];
  var args   = Array.prototype.slice.call(arguments, 1);
  return this.sort(function(a, b) {
    var aVal, bVal;
    if(typeof a[method] === 'function') {
      aVal = a[method].apply(a, args);
      bVal = b[method].apply(b, args);
    } else {
      aVal = a[method];
      bVal = b[method];
    }
    if(aVal > bVal) return 1;
    if(bVal > aVal) return -1;
    return 0;
  })[0];
}

Array.prototype.maxBy = function(method) {
  return this.sort(function(a, b) {
    if(a[method] > b[method]) return 1;
    if(b[method] > a[method]) return -1;
    return 0;
  })[this.length - 1];
}

Array.prototype.sortBy = function(propertyOrCallback) {
  if(typeof propertyOrCallback === 'string') {
    var property = propertyOrCallback;
    return this.sort(function(a, b) {
      if(a[property] > b[property]) return 1;
      if(b[property] > a[property]) return -1;
      return 0;
    });
  } else if(typeof propertyOrCallback === 'function') {
    var callback = propertyOrCallback;
    var thisArg = arguments[1];
    return this.sort(function(a, b) {
      if(callback.call(thisArg, a) > callback.call(thisArg, b)) return 1;
      if(callback.call(thisArg, b) > callback.call(thisArg, a)) return -1;
      return 0;
    });
  }
}

Array.prototype.last = function() {
  return this[this.length - 1];
}

Array.prototype.mapProperty = function(propertyName) {
  var args = Array.prototype.slice.call(arguments, 1);
  return this.map(function(element) {
    if(typeof element[propertyName] === 'function') {
      return element[propertyName].apply(element, args);
    } else {
      return element[propertyName];
    }
  });
}

Array.prototype.eachDo = function(methodName) {
  var args = Array.prototype.slice.call(arguments, 1);
  this.forEach(function(element) {
    element[methodName].apply(element, args);
  });
}

Array.prototype.eachSet = function(property, value) {
  this.forEach(function(element) {
    element[property] = value;
  });
}

Array.prototype.filterMap = function(callback) {
  var thisArg = arguments[1];
  return this.filter(function(element, i, arr) {
    return callback.call(thisArg, element, i, arr);
  }).map(function(element, i, arr) {
    return callback.call(thisArg, element, i, arr);
  });
}

////////////
// String //
////////////

String.prototype.capitalize = function() {
  return this[0].toUpperCase() + this.substring(1);
}

String.prototype.right = function(chars) {
  return this.substring(this.length - chars);
}

////////////
// Object //
////////////

Object.defineProperty(Object.prototype, 'values', {
  enumerable: false,
  configurable: true,
  get: function() {
    var obj = this;
    var keys = Object.keys(this);
    return keys.map(function(key) { return obj[key]; });
  }
});

Object.defineProperty(Object.prototype, 'forEach', {
  enumerable: false,
  configurable: true,
  writable: true,
  value: function(callback) {
    if(this == null) {
      throw new TypeError('Object.prototype.map called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }
    var keys = Object.keys(this);
    var thisArg = arguments[1];

    keys.forEach(function(key) {
      callback.call(thisArg, key, this[key]);
    }, this);
  }
});

Object.defineProperty(Object.prototype, 'map', {
  enumerable: false,
  configurable: true,
  writable: true,
  value: function(callback) {
    if (this == null) {
      throw new TypeError('Object.prototype.map called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }
    var keys = Object.keys(this);
    var thisArg = arguments[1];

    keys.forEach(function(key) {
      this[key] = callback.call(thisArg, key, this[key]);
    }, this);

    return this;
  }
});

Object.defineProperty(Object.prototype, 'find', {
  enumerable: false,
  configurable: true,
  writable: true,
  value: function(callback) {
    if (this == null) {
      throw new TypeError('Object.prototype.map called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }
    var keys = Object.keys(this);
    var thisArg = arguments[1];

    for(var i = 0; i < keys.length; i++) {
      if(callback.call(thisArg, keys[i], this[keys[i]]))
        return [keys[i], this[keys[i]]];
    };
  }
});

////////////////////
// Math functions //
////////////////////

function fact(n) {
  var fact = 1;
  for(var i = 1; i <= n; i++) {
    fact *= i;
  }
  return fact;
}

function doubfact(n) {
  var start = i % 2 ? 1 : 2;
  var fact = 1;
  for(var i = 2, curr = start; curr <= n; curr += 2) {
    fact *= curr;
  }
  return fact;
}

function commaSep(n) {
  if(n == 0) return '0';
  if(n < 0)  return '-' + commaSep(Math.abs(n));
  var string = '';
  for(var thous = 0; Math.pow(1000, thous) <= n; thous++) {
    soFar = n % Math.pow(1000, thous + 1);
    thisGroup = Math.floor(soFar / Math.pow(1000, thous));
    if(soFar == n) {
      string = String(thisGroup) + string;
    } else {
      string = ',' + ('00' + String(thisGroup)).right(3) + string;
    }
  }
  return string;
}
