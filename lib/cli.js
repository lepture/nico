/*
 * command line tools for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 */

var fs = require('fs');
var path = require('path');
var helper = require('./helper');
var utils = require('./utils');
var logging = utils.logging;


exports.build = function(prog) {
  logging.config(prog);

  logging.start('building site');
  var startTime = new Date();

  var configfile;
  logging.start('loading configuration');
  // step1: reading config from config file
  if (!prog.config) {
    if (fs.existsSync('compose.js')) {
      logging.debug("use config file compose.js");
      configfile = path.join(process.cwd(), 'compose.js');
    } else if (fs.existsSync('compose.json')) {
      logging.debug("use config file compose.json");
      configfile = path.join(process.cwd(), 'compose.json');
    }
  } else {
    configfile = path.join(process.cwd(), prog.config);
  }
  var storage = {};
  if (!configfile) {
    logging.warn('No config file is assigned, use default settings.');
    storage.config = {};
    storage.config.writers = [
      path.join(__dirname, 'writer') + '.PostWriter'
    ];
  } else {
    logging.info('Reading config file: %s', prog.config);
    storage = helper.config(configfile);
  }

  // step2: merge config from config file and process args
  storage.config.theme = prog.theme || storage.config.theme;
  storage.config.permalink = prog.permalink || storage.config.permalink;
  storage.config.source = prog.source || storage.config.source || 'content';
  storage.config.output = prog.output || storage.config.output || '_site';

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
  logging.end('configuration done');

  // step3: loading posts
  logging.start('loading posts');
  logging.debug('source directory: %s', storage.config.source);
  helper.callReader(storage);
  logging.end('posts loaded');

  // step4: run writers
  logging.start('generating site');
  logging.debug('output directory: %s', storage.config.output);
  helper.callWriters(storage);
  logging.end('site is updated');

  var timeCost = (new Date() - startTime) / 1000;
  logging.end('building finished in %d seconds', timeCost);
};
