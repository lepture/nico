/*
 * writer tools for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 */

var fs = require('fs');
var path = require('path');
var swig = require('swig');
var utils = require('./utils');
var isInitSwig = false;

function initSwig(obj) {
  if (isInitSwig) return;
  obj = obj || {};
  swig.init({
    autoescape: false,
    cache: false,
    encoding: 'utf8',
    filters: obj.filters || {},
    root: obj.root,
    tzOffset: obj.tzOffset || 0
  });
  isInitSwig = true;
}

function BaseWriter(storage) {
  this.storage = storage;
}
BaseWriter.prototype.start = function() {
  initSwig(this.storage.swigConfig);
  if (this.init) {
    this.init();
  }
  utils.logging.start('Starting %s', this.constructor.name);
  return this;
};

// render and write html to destination
BaseWriter.prototype.render = function(obj) {
  var filepath = utils.relativePath(obj.destination, this.storage.config.ouput);
  filepath = filepath.toLowerCase();
  obj.params = obj.params || {};
  obj.params.writer = {
    name: this.constructor.name,
    filepath: filepath
  };
  // swig don't support context filters
  // register context filter here
  var tpl = swig.compileFile(obj.template);
  var html = tpl.render(obj.params);

  if (filepath.slice(-1) === '/') {
    filepath += 'index.html';
  } else if (filepath.slice(-5) !== '.html') {
    filepath += '.html';
  }
  utils.logging.debug('writing content to %s', filepath);

  var destination = path.join(this.storage.config.output, filepath);
  this.write(destination, html);
};

// write file
BaseWriter.prototype.write = function(destination, content) {
  destination = destination.replace(' ', '-');
  utils.safeWrite(destination);
  fs.writeFileSync(destination, content);
};

BaseWriter.prototype.end = function() {
  if (this.run) {
    this.run();
  }
  utils.logging.end('Ending %s', this.constructor.name);
};
exports.BaseWriter = BaseWriter;


function PostWriter(storage) {
  this.storage = storage;
}
PostWriter.prototype = Object.create(BaseWriter.prototype);
PostWriter.prototype.constructor = PostWriter;
PostWriter.prototype.init = function() {
};
PostWriter.prototype.run = function() {
  var self = this;
  var posts = this.storage.sourcePublicPosts || [];
  posts = posts.concat(this.storage.sourceSecretPosts || []);
  posts.forEach(function(item) {
    self.render({
      destination: utils.destination(item, self.storage.config.permalink),
      params: {post: item},
      template: item.template || 'post.html'
    });
  });
  return this;
};
exports.PostWriter = PostWriter;
