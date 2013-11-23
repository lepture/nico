var jade = require('jade');
var path = require('path');
var _ = require('underscore');
var file = require('../sdk/file');
var getEnv = require('./_env');

var isInitJade = false;

var store = {};

function init() {
  if (isInitJade) return;
  store = getEnv();

  // register filters
  Object.keys(store.filters).forEach(function(key) {
    jade.filters[key] = store.filters[key];
  });

  isInitJade = true;
}

/* guess templates from roots */
function getTemplate(template) {
  var ret;

  store.roots.some(function(r) {
    var filepath = path.join(r, template);
    if (file.exists(filepath)) {
      ret = filepath;
      return true;
    }
  });

  return ret;
}

exports.render = function(template, data) {
  init();
  if (!store._templates) {
    store._templates = {};
  }

  if (!/\.jade$/.test(template)) {
    template = template + '.jade';
  }

  var fn = store._templates[template];
  if (!fn) {
    var filename = getTemplate(template);
    if (!filename) {
      throw new Error('template ' + template + ' not found.');
    }

    fn = jade.compile(file.read(filename), {filename: filename});
    store._templates[template] = fn;
  }

  data = _.defaults(data, store.globals);
  return fn(data);
};

exports.extname = '.jade';
