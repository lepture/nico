/**
 * Foundation for writers.
 * @module nico.BaseWriter
 */

var path = require('path');
var _ = require('underscore');
var file = require('../sdk/file');
var log = require('../sdk/log');
var filters = require('../sdk/filters');
var encode = require('../sdk/encode');
var option = require('../sdk/option');


function getEngine(name) {
  if (_.contains(['swig', 'jade'], name)) {
    return require(path.join(__dirname, '..', 'engines', name));
  }
  return file.require(name);
}


function BaseWriter() {}
BaseWriter.prototype.engine = function() {
  return getEngine(option.get('engine'));
};

BaseWriter.prototype.load = function() {
  log.info('load', this.constructor.name);
  this.setup && this.setup();
  return this;
};

BaseWriter.prototype.process = function() {
  log.info('run', this.constructor.name);
  this.run && this.run();
  return this;
};

// render and write html to destination
BaseWriter.prototype.render = function(data) {
  // data:
  //   - template
  //   - destination
  //   - params
  //   - iframes (optional)
  var filepath = path.relative(option.get('outputdir'), data.destination);
  var engine = this.engine();

  filepath = encode.filepath(filepath);

  data.params = data.params || {};
  data.params.writer = {
    name: this.constructor.name,
    filepath: filepath
  };
  data.params.config = option.get();

  // some functions need to know the params
  data.params = this.registerContextFunctions(data.params);

  var html = engine.render(data.template, data.params);

  if (filepath.slice(-1) === '/') {
    filepath += 'index.html';
  } else if (!/\.(ht|x)ml$/.test(filepath)) {
    filepath += '.html';
  }
  var destination = path.join(option.get('outputdir'), filepath);
  file.write(destination, html);

  // render iframes now
  if (data.iframes && !_.isEmpty(data.iframes)) {
    this.writeIframes(destination, data.iframes);
  }
};

BaseWriter.prototype.writeIframes = function(destination, iframes) {
  var self = this;
  var engine = this.engine();

  var dirname = path.dirname(destination);

  var writeIframe = function(item) {
    var destination = path.join(dirname, item.key) + '.html';

    var filepath = path.relative(option.get('outputdir'), destination);
    filepath = encode.filepath(filepath);
    destination = path.join(option.get('outputdir'), filepath);

    var params = {
      writer: {
        name: 'IframeWriter',
        filepath: filepath
      },
      config: option.get(),
      iframe: item
    };

    // some functions need to know the params
    params = self.registerContextFunctions(params);

    var html = engine.render('iframe.html', params);
    file.write(destination, html);
  };

  Object.keys(iframes).forEach(function(key) {
    writeIframe({key: key, code: iframes[key]});
  });
};

BaseWriter.prototype.registerContextFunctions = function(ctx) {
  var key, func, ret = _.clone(ctx);

  var fns = option.get('contextfunctions') || {};
  fns = _.defaults(fns, filters.contextfunctions);

  if (!_.isEmpty(fns)) {
    _.each(fns, function(func, key) {
      if (_.isString(func)) {
        func = file.require(func);
      }
      ret[key] = func(ret);
    });
  }

  return ret;
};

module.exports = BaseWriter;
