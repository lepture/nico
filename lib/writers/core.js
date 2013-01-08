var path = require('path');
var _ = require('underscore');
var utils = require('../utils');
var Pagination = utils.Pagination;
var pathlib = require('../utils/path');
var logging = require('colorful').logging;
var BaseWriter = require('./base').BaseWriter;


exports.PostWriter = BaseWriter.extend({
  writerName: 'PostWriter',

  render_posts: function(posts, relative) {
    var self = this;
    var len = posts.length;
    _.each(posts, function(post, i) {
      if (relative && i < len) {
        post.older = posts[i + 1];
      }
      if (relative && i > 0) {
        post.newer = posts[i - 1];
      }
      self.render({
        destination: utils.destination(
          post, self.storage.config.permalink),
        params: {post: post},
        iframes: post.iframes,
        template: post.template || 'post.html'
      });
    });
  },

  run: function(item) {
    if (item) {
      this.render_posts([item])
    } else {
      this.render_posts(this.storage.resource.publicPosts || []);
      this.render_posts(this.storage.resource.secretPosts || []);
    }
  }
});


exports.PageWriter = BaseWriter.extend({
  writerName: 'PageWriter',

  run: function(item) {
    var self = this, pages;
    if (item) {
      pages = [item];
    } else {
      pages = this.storage.resource.pages || [];
    }
    logging.debug('generating %d pages', pages.length);

    pages.forEach(function(post) {
      self.render({
        destination: utils.destination(
          post, '{{directory}}/{{filename}}.html'),
        params: {post: post},
        iframes: post.iframes,
        template: post.template || 'page.html'
      });
    });
    return this;
  }
});

exports.FileWriter = BaseWriter.extend({
  writerName: 'FileWriter',

  run: function() {
    pathlib.copy(
      this.storage.config.source,
      this.storage.config.output,
      this.storage.resource.files
    );
  }
});

exports.StaticWriter = BaseWriter.extend({
  writerName: 'StaticWriter',

  run: function() {
    var dest = path.join(this.storage.config.output, 'static');
    var theme = this.storage.config.theme;
    if (theme) {
      pathlib.copy(path.join(theme, 'static'), dest);
    }
    pathlib.copy(path.join(process.cwd(), '_static'), dest);
  }
});


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

exports.FeedWriter = BaseWriter.extend({
  writerName: 'FeedWriter',

  run: function() {
    var self = this;
    var posts = _.sortBy(
      self.storage.resource.publicPosts,
      function(item) { return item.pubdate; }
    ).slice(0, 20);
    var feed = {
      title: self.storage.config.sitename || 'Feed',
      link: 'index.html',
      output: this.storage.config.feed_output || 'feed.xml',
      posts: posts
    };
    self.render({
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
