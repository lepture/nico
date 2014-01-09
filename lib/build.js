/**
 * Build command for nico.
 * @module nico.build
 */

var path = require('path');
var _ = require('underscore');
var post = require('./sdk/post');
var log = require('./sdk/log');
var file = require('./sdk/file');
var option = require('./sdk/option');
var cache = require('./sdk/cache');
var version = require('../package').version;


function build(options) {
  log.info('nico', version);
  if (options.force) {
    cache.flush();
    delete options.force;
  }
  // remember the args the commander passed
  option.set('commanderArgs', options.args);

  var begin = new Date();

  options = parseArgs(options || {});

  Object.keys(options).forEach(function(key) {
    option.set(key, options[key]);
  });
  cache._cachedir = option.get('cachedir');

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
}

function parseArgs(options) {
  var globals = {};
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

  ['source', 'output', 'cache', 'permalink', 'theme'].forEach(function(key) {
    if (options[key]) props[key] = options[key];
  });

  // transform source to sourcedir, output to outputdir, cache to cachedir
  ['source', 'output', 'cache'].forEach(function(key) {
    if (props[key]) {
      props[key + 'dir'] = props[key];
      delete props[key];
    }
  });

  var themefile = path.resolve(path.join(props.theme || '', 'theme.js'));
  if (file.exists(themefile)) {
    var theme = require(themefile);
    if (typeof theme === 'function') {
      theme = theme(require('./'));
    }

    ['contextfunctions', 'filters', 'functions'].forEach(function(key) {
      if (theme[key]) {
        props[key] = _.defaults(
          props[key] || {}, theme[key]
        );
      }
    });

    ['ignorefilter', 'reader'].forEach(function(key) {
      if (!props[key] && theme[key]) props[key] = theme[key];
    });

    globals.theme = theme;
  }

  globals.system = require('../package');
  props.globals = globals;

  return props;
}

build.parseArgs = parseArgs;
module.exports = build;
