var path = require('path');
var _ = require('underscore');
var post = require('./sdk/post');
var log = require('./sdk/log');
var file = require('./sdk/file');
var option = require('./sdk/option');
var version = require('../package').version;


exports = module.exports = function(options) {
  log.info('nico', version);

  var begin = new Date();

  options = exports.parseArgs(options || {});

  Object.keys(options).forEach(function(key) {
    option.set(key, options[key]);
  });
  var fns = option.get('contextfunctions') || {};
  var themefile = path.resolve(path.join(option.get('theme'), 'theme.js'));
  if (file.exists(themefile)) {
    var theme = require(themefile);
    fns = _.defaults(fns, theme.contextfunctions);
  }
  option.set('contextfunctions', fns);

  // load posts
  post.load();

  // call start of writers
  var writers = option.get('writers') || [];
  writers = writers.map(function(item) {
    var Fn = file.require(item);
    if (!Fn) {
      log.error('load', 'fail to load ' + item);
      return;
    }
    var fn = new Fn();
    fn.load && fn.load();
    return fn;
  });

  // run the end of the writers
  writers.forEach(function(fn) {
    fn && fn.process && fn.process();
  });

  var end = new Date();
  log.info('time', (end - begin) / 1000 + 's');
};

exports.parseArgs = function(options) {
  var props = {};

  var config;
  options = options || {};
  if (options.config) {
    config = path.resolve(options.config);
    if (!file.exists(config)) {
      log.error('error', options.config + ' file not found');
      process.exit(2);
    }
  } else if (file.exists('nico.json')) {
    config = path.resolve('nico.json');
  } else if (file.exists('nico.js')) {
    config = path.resolve('nico.js');
  }
  if (config) {
    log.info('load', file.cleanpath(config));
    props = require(config);
  } else {
    log.warn('load', 'no config file');
  }

  ['source', 'output', 'permalink', 'theme'].forEach(function(key) {
    if (options[key]) props[key] = options[key];
  });

  // transform source to sourcedir, output to outputdir
  ['source', 'output'].forEach(function(key) {
    if (props[key]) {
      props[key + 'dir'] = props[key];
      delete props[key];
    }
  });

  return props;
};
