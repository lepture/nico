/*
 * writer tools for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 */

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

function BaseWriter() {}
BaseWriter.prototype.start = function() {
  // TODO initswig
  if (this.init) {
    this.init();
  }
  utils.logging.start('Starting %s', this.constructor.name);
};

// render and write html to destination
BaseWriter.prototype.render = function(obj) {
  var filepath = utils.relativePath(obj.destination, utils.storage.outputDirectory);
  filepath = filepath.toLowerCase();
  obj.params = obj.params || {};
  obj.params.writer = {
    name: this.constructor.name,
    filepath: filepath
  };
  // swig don't support context filters
  var tpl = swig.compileFile(obj.template);
  var html = tpl.render(obj.params);
  logging.debug('writing content to %s', filepath);

  var destination = path.join(utils.storage.outputDirectory, filename);
  if (destination.slice(-1) === '/') {
    destination += 'index.html';
  } else if (destination.slice(-5) !== '.html') {
    destination += '.html';
  }
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


function PostWriter() {}
PostWriter.prototype = Object.create(BaseWriter.prototype);
PostWriter.prototype.constructor = PostWriter;
PostWriter.prototype.init = function() {
};
PostWriter.prototype.run = function() {
};
exports.PostWriter = PostWriter;
