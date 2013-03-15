var path = require('path');
var _ = require('underscore');
var inherits = require('util').inherits;
var log = require('../sdk/log');
var post = require('../sdk/post');
var file = require('../sdk/file');
var option = require('../sdk/option');
var BaseWriter = require('./base');


function PostWriter() {}
inherits(PostWriter, BaseWriter);

PostWriter.prototype.renderPosts = function(items, relative) {
  var self = this;
  var len = items.length;
  if (!len) return;
  log.info('write', len + ' post' + (len === 1 ? '': 's'));
  var outputdir = option.get('outputdir');

  _.each(items, function(item, i) {
    item = post.read(item.filepath);
    var dest = post.permalink(item, option.get('permalink'));
    dest = path.join(outputdir, dest);

    if (relative && i < len) {
      item.older = item[i + 1];
    }
    if (relative && i > 0) {
      item.newer = items[i - 1];
    }
    self.render({
      destination: dest,
      params: {post: item},
      iframes: item.iframes,
      template: item.template || 'post'
    });
  });
};

PostWriter.prototype.run = function(item) {
  if (item) {
    this.renderPosts([item]);
  } else {
    var data = post.fetch('posts') || {};
    var publicPosts = [];
    var secretPosts = [];
    Object.keys(data).forEach(function(key) {
      var ret = data[key];
      if (!ret.meta.pubdate) {
        return;
      }
      if (!ret.meta.status || ret.meta.status === 'public') {
        publicPosts.push(ret);
      } else {
        secretPosts.push(ret);
      }
    });
    publicPosts = publicPosts.sort(function(a, b) {
      return new Date(a.meta.pubdate) - new Date(b.meta.pubdate);
    });
    this.renderPosts(publicPosts, true);
    this.renderPosts(secretPosts);
  }
};
exports.PostWriter = PostWriter;

function PageWriter() {}
inherits(PageWriter, BaseWriter);

PageWriter.prototype._create = function(item) {
  var outputdir = option.get('outputdir');
  var dest = post.permalink(item, '{{directory}}/{{filename}}.html');
  dest = path.join(outputdir, dest);
  this.render({
    destination: dest,
    params: {post: item},
    iframes: item.iframes,
    template: item.template || 'page'
  });
};

PageWriter.prototype.run = function() {
  var self = this;

  var data = post.fetch('pages') || {};
  var items = Object.keys(data);
  var len = items.length;
  log.info('write', len + ' page' + (len === 1 ? '': 's'));

  items.forEach(function(item) {
    self._create(post.read(item));
  });
  return this;
};
exports.PageWriter = PageWriter;


function FileWriter() {}
inherits(FileWriter, BaseWriter);
FileWriter.prototype.run = function() {
  var files = post.fetch('files');
  var sourcedir = option.get('sourcedir');
  var outputdir = option.get('outputdir');

  Object.keys(files).forEach(function(key) {
    var src = files[key];
    var dest = path.join(outputdir, path.relative(sourcedir, src));
    file.copy(src, dest);
  });
};
exports.FileWriter = FileWriter;


function StaticWriter() {}
inherits(StaticWriter, BaseWriter);

StaticWriter.prototype.run = function() {
  var staticdir = path.join(option.get('theme'), 'static');
  var outputdir = path.join(option.get('outputdir'), 'static');
  log.info('copy', file.cleanpath(staticdir) + ' -> ' + file.cleanpath(outputdir));

  var copy = function(src) {
    file.recurse(src, function(filepath) {
      var filename = path.relative(src, filepath);
      file.copy(filepath, path.join(outputdir, filename));
    });
  };
  if (file.exists(staticdir)) {
    copy(staticdir);
  }
  staticdir = path.join(process.cwd(), '_static');
  if (file.exists(staticdir)) {
    copy(staticdir);
  }
};
exports.StaticWriter = StaticWriter;


function ArchiveWriter() {
}
inherits(ArchiveWriter, BaseWriter);
