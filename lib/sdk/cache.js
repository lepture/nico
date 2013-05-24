var path = require('path');
var file = require('./file');


function Cache(cachedir) {
  this._cachedir = cachedir;
  this._memcache = {};
}

Cache.prototype.get = function(key) {
  if (!this._cachedir) {
    return this._memcache[key];
  }
  var cachefile = path.join(this._cachedir, key) + '.json';
  if (!file.exists(cachefile)) {
    return null;
  }
  return file.readJSON(cachefile);
};

Cache.prototype.set = function(key, value) {
  if (!this._cachedir) {
    return this._memcache[key] = value;
  }
  var cachefile = path.join(this._cachedir, key) + '.json';
  file.write(cachefile, JSON.stringify(value));
};

Cache.prototype.has = function(key) {
  if (!this._cachedir) {
    return this._memcache.hasOwnProperty(key);
  }
  var cachefile = path.join(this._cachedir, key) + '.json';
  return file.exists(cachefile);
};

Cache.prototype.flush = function() {
  if (!this._cachedir) {
    return this._memcache = {};
  }
  return file.rmdir(this._cachedir);
};

Cache.prototype.clear = function(key) {
  if (!this._cachedir) {
    delete this._memcache[key];
  } else {
    file.rmdir(key);
  }
};

exports = module.exports = new Cache();
exports.Cache = Cache;
