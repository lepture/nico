var path = require('path');
var _ = require('underscore');
exports.logging = require('./extra').logging;

exports.require = function(item) {
  if (!_.isString(item)) return item;

  var basename = path.basename(item);
  var bits = basename.split('.');
  var directory = path.dirname(item);
  if (directory.slice(0, 2) === './') {
    directory = path.join(process.cwd(), directory);
  }
  var module = require(path.join(directory, _.first(bits)));
  bits = bits.slice(1);
  if (!_.isEmpty(bits)) {
    bits.forEach(function(bit) {
      module = module[bit];
    });
  }
  return module;
};

exports.match = function(regex, content, callback) {
  // extend regex match
  var match = regex.exec(content);
  while (match) {
    callback(match);
    match = regex.exec(content);
  }
};

exports.destination = function(post, format) {
  // generate the destination of a post via permalink style
  var findValue = function(key) {
    var bits = key.split('.');
    var value = post;
    for (var i = 0; i < bits.length; i++) {
      value = value[bits[i]];
      if (!value) return '';
    }
    if (!value) return '';
    if (typeof value === 'function') value = value();
    if (typeof value === 'number' && value < 10) {
      return '0' + value;
    }
    return value;
  };
  exports.match(/\{\{(.*?)\}\}/g, format, function(match) {
    format = format.replace(match[0], findValue(match[1]));
  });
  format = format.replace(/\\\\/g, '/');
  format = format.replace(/\s+/g, '-');
  if (format.slice(0, 1) == '/') {
    return format.slice(1);
  }
  return format;
};
