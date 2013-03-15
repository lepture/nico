module.exports = function() {
  var log = require('../sdk/log');
  var file = require('../sdk/file');
  var option = require('../sdk/option');
  var path = require('path');
  var _ = require('underscore');

  var exports = {};

  // find filters
  var filters = option.get('filters') || {};
  Object.keys(filters).forEach(function(key) {
    var func = filters[key];
    if (_.isString(func)) {
      func = file.require(func);
    }
    filters[key] = func;
  });
  exports.filters = filters;

  // find roots
  var roots = [];
  var templates = path.join(process.cwd(), '_templates');
  if (file.exists(templates)) {
    roots.push(templates);
  }
  var theme = option.get('theme');
  if (theme && file.exists(path.join(theme, 'templates'))) {
    roots.push(path.join(theme, 'templates'));
  }
  if (!roots.length) {
    log.warn('template', 'no templates available');
  }
  exports.roots = roots;

  var globals = option.get('globals') || {};
  globals.system = require('../../package');

  var themefile = path.resolve(path.join(option.get('theme'), 'theme.js'));
  if (file.exists(themefile)) {
    globals.theme = require(themefile);
  }
  globals.config = option.get();

  exports.globals = globals;
  return exports;
};
