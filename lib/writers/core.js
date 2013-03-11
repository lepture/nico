var path = require('path');
var _ = require('underscore');
var inherits = require('util').inherits;
var log = require('../sdk/log');
var post = require('../sdk/post');
var BaseWriter = require('./base');


function PostWriter() {
}
inherits(PostWriter, BaseWriter);

PostWriter.prototype.renderPosts = function(items, relative) {
  var self = this;
  var len = items.length;
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
      template: item.template || 'post.html'
    });
  });
};

PostWriter.prototype.run = function(item) {
  if (item) {
    this.renderPosts([item]);
  } else {
    var data = post.list('posts') || {};
    var publicPosts = [];
    var secretPosts = [];
    Object.keys(data).forEach(function(key) {
      var ret = data[key];
      if (!ret.status || ret.status === 'public') {
        publicPosts.push(ret);
      } else {
        secretPosts.push(ret);
      }
    });
    publicPosts = publicPosts.sort(function(a, b) {
      return new Date(a.pubdate) - new Date(b.pubdate);
    });

    publicPosts = _.sortBy(publicPosts, function(item) {
      return item.pubdate;
    }).reverse();
    this.renderPosts(publicPosts, true);
    this.renderPosts(secretPosts);
  }
};
exports.PostWriter = PostWriter;

function PageWriter() {
}
inherits(PageWriter, BaseWriter);

PageWriter.prototype.run = function(item) {
  var self = this, items;

  if (item) {
    items = [item];
  } else {
    items = post.list('pages') || [];
  }
  log.debug('render', items.length + ' pages');

  var outputdir = option.get('outputdir');
  items.forEach(function(item) {
    var dest = post.permalink(item, '{{directory}}/{{filename}}.html');
    dest = path.join(outputdir, dest);

    self.render({
      destination: dest,
      params: {post: item},
      iframes: item.iframes,
      template: item.template || 'page.html'
    });
  });
  return this;
};
exports.PageWriter = PageWriter;


function FileWriter() {
}
inherits(FileWriter, BaseWriter);
FileWriter.prototype.run = function() {
  var files = post.list('files');
  var sourcedir = option.get('sourcedir');
  var outputdir = option.get('outputdir');

  Object.keys(files).forEach(function(key) {
    var src = files[key];
    var dest = path.join(outputdir, path.relative(sourcedir, src));
    file.copy(src, dest);
  });
};
exports.FileWriter = FileWriter;


function StaticWriter() {
}
inherits(StaticWriter, BaseWriter);

StaticWriter.run = function() {
  var staticdir = path.join(option.get('theme'), 'static');
  var outputdir = path.join(option.get('outputdir'), 'static');

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

ArchiveWriter.prototype.renderPagination = function(items, title, output, template) {
  var self = this;
};

var ArchiveWriter = BaseWriter.extend({
  writerName: 'ArchiveWriter',

  render_pagination: function(posts, title, output, template) {
    var self = this;
    posts = _.sortBy(posts, function(item) { return item.pubdate; }).reverse();
    var perpage = this.storage.config.perpage || 30;
    var pagi = new Pagination(posts, 1, perpage);
    pagi.title = title;
    pagi.output = output;
    this.render({
      destination: output,
      params: {pagination: pagi},
      template: template
    });

    if (pagi.pages < 2) {
      return;
    }

    _.each(_.range(1, pagi.pages + 1), function(i) {
      pagi = new Pagination(posts, i, perpage);
      pagi.title = title;
      pagi.output = path.join(path.dirname(output), 'page', i + '.html');
      self.render({
        destination: pagi.output,
        params: {pagination: pagi},
        template: template
      });
    });
  },

  run: function() {
    var posts = this.storage.resource.publicPosts;
    var title = this.storage.config.archive_title || 'Archive';
    var output = this.storage.config.archive_output || 'index.html';
    var template = this.storage.config.archive_template || 'archive.html';
    this.render_pagination(posts, title, output, template);
  }
});
exports.ArchiveWriter = ArchiveWriter;

exports.YearWriter = ArchiveWriter.extend({
  writerName: 'YearWriter',

  run: function() {
    var years = {};
    var self = this;
    var template = this.storage.config.year_template || 'archive.html';
    _.each(this.storage.resource.publicPosts, function(item) {
      var pubyear = item.pubdate.year();
      if (!years.hasOwnProperty(pubyear)) {
        years[pubyear] = [item];
      } else {
        years[pubyear].push(item);
      }
    });
    _.each(years, function(value, key) {
      self.render_pagination(value, key, key + '/index.html', template);
    });
  }
});

exports.TagWriter = ArchiveWriter.extend({
  writerName: 'TagWriter',

  run: function() {
    var tags = {};
    var self = this;
    var template = this.storage.config.tag_template || 'archive.html';
    _.each(this.storage.resource.publicPosts, function(item) {
      _.each(item.tags, function(tag) {
        if (!tags.hasOwnProperty(tag)) {
          tags[tag] = [item];
        } else {
          tags[tag].push(item);
        }
      });
    });
    _.each(tags, function(value, key) {
      self.render_pagination(
        value, key,
        path.join('tag', key, 'index.html'),
        template
      );
    });
  }
});


exports.FeedWriter = BaseWriter.extend({
  writerName: 'FeedWriter',

  run: function() {
    var posts = this.storage.resource.publicPosts.slice(0, 20);
    var feed = {
      title: this.storage.config.sitename || 'Feed',
      link: 'index.html',
      output: this.storage.config.feed_output || 'feed.xml',
      posts: posts
    };
    this.render({
      destination: feed.output,
      params: {feed: feed},
      template: this.storage.config.feed_template || 'feed.xml'
    });
  }
});

exports.TagcloudWriter = BaseWriter.extend({
  writerName: 'TagcloudWriter',

  run: function() {
  }
});

exports.DirectoryWriter = ArchiveWriter.extend({
  writerName: 'DirectoryWriter',

  run: function() {
    var dirs = {};
    var self = this;
    var template = this.storage.config.directory_template || 'archive.html';
    _.each(this.storage.resource.publicPosts, function(item) {
      if (!dirs.hasOwnProperty(item.directory)) {
        dirs[item.directory] = [item];
      } else {
        dirs[item.directory].push(item);
      }
    });
    _.each(dirs, function(value, key) {
      self.render_pagination(value, key, key + '/index.html', template);
    });
  }
});
