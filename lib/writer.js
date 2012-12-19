/*
 * writer tools for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 */

var fs = require('fs');
var path = require('path');
var swig = require('jinja');
var _ = require('underscore');
var utils = require('./utils');
var pathlib = require('./utils/path');
var logging = utils.logging;
var Class = require('arale').Class;
var Pagination = utils.Pagination;
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
    cache: true,
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
    if (this.setup) {
      this.setup();
    }
    logging.start('Starting %s', this.writerName);
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
    pathlib.safeWrite(destination);
    fs.writeFileSync(destination, content);
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


exports.PostWriter = BaseWriter.extend({
  writerName: 'PostWriter',

  run: function() {
    var self = this;
    var posts = this.storage.resource.publicPosts || [];
    posts = posts.concat(this.storage.resource.secretPosts || []);
    logging.debug('generating %d posts', posts.length);

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
    var pages = this.storage.resource.pages || [];
    logging.debug('generating %d pages', pages.length);

    var page;
    pages.forEach(function(item) {
      page = createPost(self.storage, item);
      self.render({
        destination: utils.destination(
          page, '{{directory}}/{{filename}}.html'),
        params: {post: page},
        iframes: page.iframes,
        template: page.template || 'page.html'
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
      pagi.output = path.join(path.dirname(output), 'page', i);
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
    var items = _.sortBy(
      self.storage.resource.publicPosts,
      function(item) { return item.pubdate; }
    ).slice(0, 20);
    var posts = [];
    items.forEach(function(item) {
      posts.push(createPost(self.storage, item));
    });
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


// helpers
function createPost(storage, item) {
  return new storage.config.PostRender({
    title: item.title,
    content: item.content,
    filepath: item.filepath,
    root: storage.config.source,
    parser: storage.config.parser
  });
}
