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
  this.splice(index, 1);
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

////////////
// String //
////////////

String.prototype.capitalize = function() {
  return this[0].toUpperCase() + this.substring(1);
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
