var path = require('path');
var _ = require('underscore');

var defaultValues = {
  // nico should rebuild the cache or not
  cachetag: '0.2.0',

  sourcedir: 'content',
  outputdir: '_site',
  encoding: 'utf8',
  tocLevel: 3,
  engine: 'swig',
  reader: null,
  ignoredotfiles: true
};

var defaultMaps = {
};

function Option(options) {
  this._cache = options || {};
}

Option.prototype.get = function(key) {
  if (!key) {
    return _.defaults(this._cache, defaultValues);
  }
  var ret = this._cache[key];
  if (defaultMaps[key]) {
    return _.defaults(ret || {}, defaultMaps[key]);
  }
  if (ret) return ret;
  return defaultValues[key];
};
Option.prototype.set = function(key, value) {
  this._cache[key] = value;
  return value;
};
Option.prototype.option = function(key, value) {
  if (!value) return this.get(key);
  return this.set(key, value);
};
Option.prototype.clean = function(key) {
  if (!key) {
    this._cache = {};
  } else if (this._cache[key]) {
    delete this._cache[key];
  }
};

exports = module.exports = new Option();

exports.Option = Option;

exports.defaults = function(obj) {
  if (!obj) { return defaultMaps; }
  defaultMaps = obj;
};

function patch() {
  if (Date.prototype.hasOwnProperty('year')) return;
  // because option will be used everywhere, patch it here
  Object.defineProperty(Date.prototype, 'year', {
    get: function() {
      return this.getFullYear();
    }
  });

  Object.defineProperty(Date.prototype, 'month', {
    get: function() {
      return this.getMonth() + 1;
    }
  });
  Object.defineProperty(Date.prototype, 'date', {
    get: function() {
      return this.getDate();
    }
  });
}
patch();
