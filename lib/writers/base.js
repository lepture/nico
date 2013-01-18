var fs = require('fs');
var path = require('path');
var swig = require('jinja');
var _ = require('underscore');
var utils = require('../utils');
var pathlib = require('../utils/pathlib');
var logging = require('colorful').logging;
var Class = require('arale').Class;
var isInitSwig = false;


function initSwig(obj) {
  if (isInitSwig) return;
  obj.swigConfig = obj.swigConfig || {};
  _.extend(obj.swigConfig, obj.config.swigConfig || {});
  var swigConfig = obj.swigConfig;

  // find swig root
  if (!swigConfig.root) {
    swigConfig.root = [];
    var templates = path.join(process.cwd(), '_templates');
    if (fs.existsSync(templates)) swigConfig.root.push(templates);
    if (obj.config && obj.config.theme) {
      swigConfig.root.push(path.join(obj.config.theme, 'templates'));
    }
    if (!swigConfig.root.length) {
      logging.error('no theme is assigned.');
      process.exit(1);
    }
  }

  var key, func;
  // find swig filters
  swigConfig.filters = swigConfig.filters || {};
  for (key in swigConfig.filters) {
    func = swigConfig.filters[key];
    if (_.isString(func)) {
      func = utils.require(func);
    }
    swigConfig.filters[key] = func;
  }

  // register globals
  swigConfig.globals = swigConfig.globals || {};
  if (obj.resource) swigConfig.globals.resource = obj.resource;
  if (obj.config) swigConfig.globals.config = obj.config;

  // register functions
  for (key in swigConfig.functions) {
    func = swigConfig.functions[key];
    if (_.isString(func)) {
      func = utils.require(func);
    }
    swigConfig.globals[key] = func;
  }

  swig.init({
    autoescape: false,
    cache: false,
    allowErrors: false,
    encoding: swigConfig.encoding || 'utf8',
    filters: swigConfig.filters,
    globals: swigConfig.globals,
    root: swigConfig.root,
    tzOffset: swigConfig.tzOffset || 0
  });
  isInitSwig = true;
}


var BaseWriter = Class.create({
  writerName: 'BaseWriter',

  initialize: function(storage) {
    initSwig(storage);
    this.storage = storage;
  },

  start: function() {
    logging.start('Starting %s', this.writerName);
    if (this.setup) {
      this.setup();
    }
    return this;
  },

  // render and write html to destination
  render: function(obj) {
    var filepath = pathlib.relative(
      this.storage.config.output, obj.destination
    );
    filepath = filepath.toLowerCase();
    obj.params = obj.params || {};
    obj.params.writer = {
      name: this.writerName,
      filepath: filepath
    };
    obj.params.config = this.storage.config;

    // swig don't support context functions
    obj.params = this.registerContextFunctions(obj.params);

    var tpl = swig.compileFile(obj.template);
    var html = tpl.render(obj.params);

    if (filepath.slice(-1) === '/') {
      filepath += 'index.html';
    } else if (!/\.(ht|x)ml$/.test(filepath)) {
      filepath += '.html';
    }
    logging.debug('writing content to %s', filepath);

    var destination = path.join(this.storage.config.output, filepath);
    this.write(destination, html);

    // swig don't support context filter, we can only inject code here.
    if (obj.iframes && !_.isEmpty(obj.iframes)) {
      this.writeIframes(destination, obj.iframes);
    }
  },

  // write file
  write: function(destination, content) {
    destination = destination.replace(' ', '-');
    pathlib.writeFileSync(destination, content);
  },

  end: function() {
    if (this.run) {
      this.run();
    }
    logging.end('Ending %s', this.writerName);
  },

  // iframe helper
  writeIframes: function(destination, iframes) {
    var self = this;
    var tpl = swig.compileFile('iframe.html');
    var html = '';
    var dirname = path.dirname(destination);

    var writeIframe = function(item) {
      var destination = path.join(dirname, item.key) + '.html';
      var filepath = pathlib.relative(
        self.storage.config.output, destination
      );
      var params = {
        writer: {
          name: 'IframeWriter',
          filepath: filepath
        },
        iframe: item
      };
      params.config = self.storage.config;
      params = self.registerContextFunctions(params);
      html = tpl.render(params);
      self.write(destination, html);
    };

    for (var key in iframes) {
      writeIframe({key: key, code: iframes[key]});
    }
  },

  registerContextFunctions: function(ctx) {
    var key, func, ret = _.clone(ctx);
    var swigConfig = this.storage.swigConfig || {};
    var contextfunctions = swigConfig.contextfunctions;
    if (!_.isEmpty(contextfunctions)) {
      _.each(contextfunctions, function(func, key) {
        if (_.isString(func)) {
          func = utils.require(func);
        }
        ret[key] = func(ret);
      });
    }

    return ret;
  }
});
exports.BaseWriter = BaseWriter;
