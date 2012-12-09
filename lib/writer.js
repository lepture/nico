/*
 * writer tools for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 */

var fs = require('fs');
var path = require('path');
var swig = require('swig');
var underscore = require('underscore');
var utils = require('./utils');
var Class = require('arale').Class;
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

var BaseWriter = Class.create({
  writerName: 'BaseWriter',

  initialize: function(storage) {
    this.storage = storage;
  },

  start: function() {
    initSwig(this.storage.swigConfig);
    if (this.setup) {
      this.setup();
    }
    utils.logging.start('Starting %s', this.writerName);
    return this;
  },
  // render and write html to destination
  render: function(obj) {
    var filepath = utils.relativePath(
      obj.destination, this.storage.config.ouput);
    filepath = filepath.toLowerCase();
    obj.params = obj.params || {};
    obj.params.writer = {
      name: this.writerName,
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

    // swig don't support context filter, we can only inject code here.
    if (obj.iframes && !underscore.isEmpty(obj.iframes)) {
      this.writeIframes(destination, obj.iframes);
    }
  },

  // write file
  write: function(destination, content) {
    destination = destination.replace(' ', '-');
    utils.safeWrite(destination);
    fs.writeFileSync(destination, content);
  },

  end: function() {
    if (this.run) {
      this.run();
    }
    utils.logging.end('Ending %s', this.writerName);
  },

  // iframe helper
  writeIframes: function(destination, iframes) {
    var self = this;
    var tpl = swig.compileFile('iframe.html');
    var html = '';
    var dirname = path.dirname(destination);
    var writeIframe = function(item) {
      html = tpl.render(item);
      self.write(path.join(dirname, item.key) + '.html', html);
    };
    for (var key in iframes) {
      writeIframe({key: key, code: iframes[key]});
    }
  }
});
exports.BaseWriter = BaseWriter;


exports.PostWriter = BaseWriter.extend({
  writerName: 'PostWriter',

  run: function() {
    var self = this;
    var posts = this.storage.resource.publicPosts || [];
    posts = posts.concat(this.storage.resource.secretPosts || []);

    var post;
    posts.forEach(function(item) {
      post = createPost(self.storage, item);
      self.render({
        destination: utils.destination(
          post, self.storage.config.permalink),
        params: {post: post},
        iframes: post.iframes,
        template: post.template || 'post.html'
      });
    });
    return this;
  }
});


exports.PageWriter = BaseWriter.extend({
  writerName: 'PageWriter',

  run: function() {
    var self = this;
    var posts = this.storage.resource.pages || [];

    var post;
    posts.forEach(function(item) {
      post = createPost(self.storage, item);
      self.render({
        destination: utils.destination(
          post, self.storage.config.permalink),
        params: {post: post},
        iframes: post.iframes,
        template: post.template || 'page.html'
      });
    });
    return this;
  }
});


exports.ArchiveWriter = BaseWriter.extend({
  writerName: 'ArchiveWriter',

  run: function() {
    // pagination
  }
});


exports.FileWriter = BaseWriter.extend({
  writerName: 'FileWriter',

  run: function() {
  }
});


exports.StaticWriter = BaseWriter.extend({
  writerName: 'StaticWriter',

  run: function() {
  }
});


// helpers
function createPost(storage, item) {
  return new storage.config.PostRender(
    item.filepath,
    storage.config.source,
    storage.config.parser
  );
}
