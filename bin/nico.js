#!/usr/bin/env node

require('colorful').colorful();
var cli = require('../lib/cli');
var utils = require('../lib/utils');
var logging = utils.logging;

var program = require('commander');
program._name = 'nico';
program.usage('[command] [options]');

program.
  command('build').
  description('build the site');

program.
  command('help [<command>]').
  description('show help information').
  action(help);

var builder = new program.Command();
builder._name = 'nico build';
builder.usage('[options]');
builder.
  option('-C --config <config>', 'the config file [nico.json]').
  option('-I --source <source>', 'the content directory [content]').
  option('-O --output <output>', 'the output directory [_site]').
  option('--theme <theme>', 'the theme path').
  option('--permalink <permalink>', 'permalink style of your site').
  option('-v --verbose', 'show more logging').
  option('-q --quiet', 'show less logging');



args = process.argv.slice(1);
program.parse(process.argv);

var subcmd = program.args[0];
if (subcmd === 'build') {
  builder.parse(args);
  logging.config(builder);
  logging.start('building site');
  var startTime = new Date();

  logging.start('loading configuration');
  var storage = cli.getConfig(builder);
  storage.swigConfig = cli.getSwigConfig(storage.config);
  logging.end('configuration done');

  logging.start('loading posts');
  logging.debug('source directory: %s', storage.config.source);
  cli.callReader(storage);
  logging.end('posts loaded');

  logging.start('generating site');
  logging.debug('output directory: %s', storage.config.output);
  cli.callWriters(storage);
  logging.end('site is updated');

  var timeCost = (new Date() - startTime) / 1000;
  logging.end('building finished in %d seconds', timeCost);
} else {
  help();
}

function help() {
  var subcmd = program.args[0];
  if (subcmd === 'build') {
    process.stdout.write(builder.helpInformation());
    builder.emit('--help');
  } else {
    process.stdout.write(program.helpInformation());
    program.emit('--help');
  }
  process.exit();
}
