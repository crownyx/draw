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
  var mapped = this.map(callback);
  return mapped.flatten();
}

Array.prototype.minBy = function(method) {
  return this.sort(function(a, b) {
    if(a[method] > b[method]) return 1;
    if(b[method] > a[method]) return -1;
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
