var swig = require('swig');
var _ = require('underscore');
var option = require('../sdk/option');
var getEnv = require('./_env');

var isInitSwig = false;

var store = {};

function init() {
  if (isInitSwig) return;
  store = getEnv();

  swig.init({
    autoescape: false,
    cache: false,
    allowErrors: true,
    encoding: option.get('encoding'),
    filters: store.filters,
    root: store.roots,
    tzOffset: option.get('tzOffset', 0)
  });

  isInitSwig = true;
}

exports.render = function(template, data) {
  init();
  if (!/\.html$/.test(template)) {
    template = template + '.html';
  }
  var tpl = swig.compileFile(template);

  data = _.defaults(data, store.globals);
  return tpl.render(data);
};

exports.extname = '.html';
