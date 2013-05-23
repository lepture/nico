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
  log.info('write', len + ' post' + (len === 1 ? '' : 's'));
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
      template: item.meta.template || 'post'
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
    if (secretPosts.length) {
      this.renderPosts(secretPosts);
    }
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
    template: item.meta.template || 'page'
  });
};

PageWriter.prototype.run = function() {
  var self = this;

  var data = post.fetch('pages') || {};
  var items = Object.keys(data);
  var len = items.length;
  log.info('write', len + ' page' + (len === 1 ? '' : 's'));

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


function ArchiveWriter() {}
inherits(ArchiveWriter, BaseWriter);
exports.ArchiveWriter = ArchiveWriter;

ArchiveWriter.prototype.fetchPosts = function(fn) {
  var data = post.fetch('posts') || {};
  var items = [];
  Object.keys(data).forEach(function(key) {
    var ret = data[key];
    if (!ret.meta.pubdate) {
      return;
    }
    if (!ret.meta.status || ret.meta.status === 'public') {
      if (fn) {
        fn(ret);
      } else {
        items.push(ret);
      }
    }
  });
  if (fn) return;
  return items;
};
ArchiveWriter.prototype._create = function(template, dest, items, title) {
  items= items.sort(function(a, b) {
    return new Date(b.meta.pubdate) - new Date(a.meta.pubdate);
  });

  var outputdir = option.get('outputdir');
  dest = path.join(outputdir, dest);

  // first page
  var pagi = post.paginate(1, items);
  var self = this;
  pagi.title = title;
  self.render({
    destination: dest,
    params: {pagination: pagi},
    template: template
  });

  _.each(_.range(1, pagi.pages + 1), function(i) {
    pagi = post.paginate(i, items);
    pagi.title = title + ' / ' + i;
    var output = path.join(path.dirname(dest), 'page', i + '.html');
    self.render({
      destination: output,
      params: {pagination: pagi},
      template: template
    });
  });
};
ArchiveWriter.prototype.run = function() {
  var template = option.get('archive_template') || 'archive';
  var dest = option.get('archive_output') || 'index.html';
  var title = option.get('archive_title') || 'Archive';
  var items = this.fetchPosts();
  this._create(template, dest, items, title);
};

function DirectoryWriter() {}
inherits(DirectoryWriter, ArchiveWriter);
exports.DirectoryWriter = DirectoryWriter;

DirectoryWriter.prototype.run = function() {
  var dirs = {};

  this.fetchPosts(function(item) {
    if (dirs[item.meta.directory]) {
      dirs[item.meta.directory].push(item);
    } else {
      dirs[item.meta.directory] = [item];
    }
  });

  var template = option.get('directory_template') || 'archive';
  var self = this;
  _.each(dirs, function(value, title) {
    self._create(template, title + '/index.html', value, title);
  });
};

function YearWriter() {}
inherits(YearWriter, ArchiveWriter);
exports.YearWriter = YearWriter;

YearWriter.prototype.run = function() {
  var dirs = {};

  this.fetchPosts(function(item) {
    var pubdate = new Date(item.meta.pubdate);
    if (dirs[pubdate.year]) {
      dirs[pubdate.year].push(item);
    } else {
      dirs[pubdate.year] = [item];
    }
  });

  var template = option.get('year_template') || 'archive';
  var self = this;
  _.each(dirs, function(value, title) {
    self._create(template, title + '/index.html', value, title);
  });
};

function TagWriter() {}
inherits(TagWriter, ArchiveWriter);
exports.TagWriter = TagWriter;

TagWriter.prototype.run = function() {
  var dirs = {};

  this.fetchPosts(function(item) {
    if (!item.meta.tags) return;

    var tags = item.meta.tags.split(',');
    tags.forEach(function(tag) {
      tag = tag.trim();
      if (dirs[tag]) {
        dirs[tag].push(item);
      } else {
        dirs[tag] = [item];
      }
    });
  });

  var template = option.get('tag_template') || 'archive';
  var self = this;
  _.each(dirs, function(value, title) {
    self._create(template, 'tag/' + title + '/index.html', value, title);
  });
};

function FeedWriter() {}
inherits(FeedWriter, ArchiveWriter);
exports.FeedWriter = FeedWriter;

FeedWriter.prototype.run = function() {
  var items = this.fetchPosts();
  items= items.sort(function(a, b) {
    return new Date(b.meta.pubdate) - new Date(a.meta.pubdate);
  });
  items = items.slice(0, 20);
  items = items.map(function(item) {
    return post.read(item.filepath);
  });

  var outputdir = option.get('outputdir');
  var feed = {
    title: option.get('sitename') || 'Feed',
    output: path.join(outputdir, option.get('feed_output') || 'feed.xml'),
    posts: items
  };

  this.render({
    destination: feed.output,
    params: {feed: feed},
    template: option.get('feed_template') || 'feed'
  });
};
