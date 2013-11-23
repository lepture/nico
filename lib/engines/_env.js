module.exports = function() {
  var log = require('../sdk/log');
  var file = require('../sdk/file');
  var option = require('../sdk/option');
  var fn = require('../sdk/filters');
  var post = require('../sdk/post');
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

  var globals = option.get('globals') || {};

  globals.config = option.option();
  globals.resource = {
    posts: post.fetch('posts'),
    pages: post.fetch('pages')
  };

  // functions
  var fns = option.get('functions') || {};
  globals = _.defaults(globals, fns);
  globals = _.defaults(globals, fn.functions);

  exports.filters = _.defaults(filters, fn.filters);
  exports.roots = roots;
  exports.globals = globals;
  return exports;
};
