var path = require('path');
var swig = require('swig');
var _ = require('underscore');
var log = require('../sdk/log');
var file = require('../sdk/file');
var option = require('../sdk/option');

var isInitSwig = false;

function init() {
  if (isInitSwig) return;

  var filters = option.get('filters') || {};
  Object.keys(filters).forEach(function(key) {
    var func = filters[key];
    if (_.isString(func)) {
      func = file.require(func);
    }
    filters[key] = func;
  });

  // find swig root
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

  swig.init({
    autoescape: false,
    cache: false,
    allowErrors: false,
    encoding: option.get('encoding'),
    filters: filters,
    root: roots,
    tzOffset: option.get('tzOffset', 0)
  });

  isInitSwig = true;
}

exports.render = function(template, data) {
  init();
  var tpl = swig.compileFile(template);

  data = _.defaults(data, option.get('globals'));
  data.config = option._cache;

  return tpl.render(data);
};
