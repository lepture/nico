/*
 * command line tools for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 *
 *
 * Documentation on storage:
 *
 * storage.config = {
 *   // anything in compose.json
 *   source:
 *   output:
 *   theme:
 *   permalink:
 *   writers:
 * }
 *
 * storage.resource = {
 *   files:
 *   pages:
 *   publicPosts:
 *   secretPosts:
 * }
 *
 * storage.swigConfig = {
 *   root: [],
 *   filters: [],
 *   tzOffset: 0
 *   ...
 * }
 */

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var utils = require('./utils');
var filters = require('./filters');
var reader = require('./reader');
var logging = utils.logging;


exports.getConfig = function(prog) {
  var configfile, storage = {};
  if (!prog.config) {
    if (fs.existsSync('nico.js')) {
      logging.debug("use config file nico.js");
      configfile = path.join(process.cwd(), 'nico.js');
    } else if (fs.existsSync('nico.json')) {
      logging.debug("use config file nico.json");
      configfile = path.join(process.cwd(), 'nico.json');
    }
  } else {
    if (prog.config.slice(0, 1) === '/') {
      configfile = prog.config;
    } else {
      configfile = path.join(process.cwd(), prog.config);
    }
  }
  if (!configfile) {
    logging.warn('No config file is assigned, use default settings.');
    storage.config = {};
    storage.config.writers = [
      path.join(__dirname, 'writer') + '.PostWriter'
    ];
  } else {
    logging.info('Reading config file: %s', configfile);
    storage.config = parseConfig(configfile);
  }

  // merge config from config file and process args
  storage.config.theme = prog.theme || storage.config.theme;
  storage.config.permalink = prog.permalink || storage.config.permalink;
  storage.config.source = prog.source || storage.config.source || 'content';
  storage.config.output = prog.output || storage.config.output || '_site';
  storage.config.args = prog.args;

  var config = storage.config;
  if (config.theme && config.theme.slice(0, 1) != '/') {
    storage.config.theme = path.join(process.cwd(), config.theme);
  }
  if (config.source.slice(0, 1) != '/') {
    storage.config.source = path.join(process.cwd(), config.source);
  }
  if (config.output.slice(0, 1) != '/') {
    storage.config.output= path.join(process.cwd(), config.output);
  }
  return storage;
};


exports.getSwigConfig = function(config) {
  var swigConfig = {};
  swigConfig.filters = config.filters || {};

  _.extend(swigConfig.filters, filters.filters);
  swigConfig.contextfilters = config.contextfilters || {};
  _.extend(swigConfig.contextfilters, filters.contextfilters);
  swigConfig.functions = config.functions || {};
  _.extend(swigConfig.functions, filters.functions);
  swigConfig.contextfunctions = config.contextfunctions || {};
  _.extend(swigConfig.contextfunctions, filters.contextfunctions);

  swigConfig.globals = swigConfig.globals || {};
  swigConfig.globals.system = require('../package.json');
  var theme;
  try {
    theme = require(path.join(config.theme, 'theme.js'));
  } catch (e) {
    logging.warn('There is no theme config file');
  }
  if (theme) swigConfig.globals.theme = theme;
  return swigConfig;
};


exports.callReader = function(storage) {
  // need storage.config.source
  storage.config.PostRender = storage.config.PostRender || reader.Post;

  storage.resource = storage.resource || {};
  storage.resource.files = [];
  storage.resource.publicPosts = [];
  storage.resource.secretPosts = [];
  storage.resource.pages = [];

  var postInfo = function(post) {
    return {
      filepath: post.filepath,
      title: post.title,
      meta: post.meta,
      pubdate: post.pubdate,
      updated: post.updated,
      tags: post.tags,
      filename: post.filename,
      directory: post.directory,
      template: post.template
    };
  };

  var abspath = storage.config.source;
  var files = utils.walkdir(abspath, storage.config.ignore).files;
  files.forEach(function(filepath) {
    var basename = path.basename(filepath);
    var bits = basename.split('.');
    if (bits.length === 1) {
      storage.resource.files.push(abspath);
    } else if (_.indexOf(['md', 'mkd', 'markdown'], _.last(bits)) === -1) {
      storage.resource.files.push(filepath);
    } else {
      var post = new storage.config.PostRender({
        filepath: filepath,
        root: abspath
      });
      if (!post.pubdate) {
        storage.resource.pages.push(postInfo(post));
      } else if (post.status === 'secret') {
        storage.resource.secretPosts.push(postInfo(post));
      } else if (post.status !== 'draft') {
        storage.resource.publicPosts.push(postInfo(post));
      }
    }
  });
  return storage;
};

exports.callWriters = function(storage) {
  // need storage.config.writers
  storage.config.writers.forEach(function(item) {
    var Writer = utils.require(item);
    var writer = new Writer(storage);
    writer.start();
    writer.end();
  });
  return storage;
};


function parseConfig(configfile) {
  if (_.isString(configfile)) {
    return require(configfile);
  } else if (_.isObject(configfile)) {
    return configfile;
  }
  return {};
}
exports.parseConfig = parseConfig;
