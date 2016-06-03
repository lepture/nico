var swig = require('swig');
var _ = require('underscore');
var option = require('../sdk/option');
var getEnv = require('./_env');

var isInitSwig = false;

var store = {};

function init() {
  if (isInitSwig) return;
  store = getEnv();
  var filters = store.filters;

  swig.setDefaults({
    autoescape: false,
    cache: false,
    loader: swig.loaders.fs(store.roots[0], option.get('encoding'))
  });

  for(var func in filters){
    swig.setFilter(func, filters[func]);
  }
  swig.setDefaultTZOffset(option.get('tzOffset', 0));

  isInitSwig = true;
}

exports.render = function(template, data) {
  init();
  if (!/\.html$/.test(template)) {
    template = template + '.html';
  }
  var tpl = swig.compileFile(template);

  data = _.defaults(data, store.globals);
  return tpl(data);
};

exports.extname = '.html';
