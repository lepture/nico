var path = require('path');
var format = require('util').format;

exports.filters = {
  xmldatetime: function(m) {
    m = new Date(m);
    return m.toISOString();
  },
  markdown: function(text) {
    var mo = require('./markdown');
    return mo.render(text);
  },
  highlight: function(code, language) {
    return require('./highlight').render(code, language);
  },
  read: function(item) {
    var post = require('./post');
    return post.read(item.filepath);
  }
};

exports.functions = {
};

exports.contextfunctions = {
  permalink_url: function(ctx) {
    var basepath = path.dirname(ctx.writer.filepath);

    return function(item) {
      var url;
      var post = require('./post');
      var permalink = ctx.config.permalink;

      if (item.pubdate) {
        url = post.permalink(item, permalink);
      } else {
        if (/\.html$/.test(permalink)) {
          url = post.permalink(item, '{{directory}}/{{filename}}.html');
        } else {
          url = post.permalink(item, '{{directory}}/{{filename}}');
        }
      }

      url = path.relative(basepath, url);
      url = url.replace(/\/index(\.html)?$/, '/');
      url = url.replace(/\\/g, '/');
      if (url === 'index') {
        url = './';
      }
      return url;
    };
  },

  static_url: function(ctx) {
    var basepath = path.dirname(ctx.writer.filepath);

    return function(url) {
      if (url.slice(0) === '/') {
        url = url.slice(1);
      }
      ctx.config = ctx.config || {};
      var prefix = ctx.config.static_prefix || 'static';
      if (prefix.slice(-1) === '/') {
        prefix = prefix.slice(0, -1);
      }
      if (prefix.slice(0) === '/') {
        return prefix + '/' + url;
      }
      url = path.join(prefix, url);
      url = path.relative(basepath, url);
      url = url.replace(/\\/g, '/');
      if (url.charAt(0) !== '.') url = './' + url;
      return url;
    };
  },

  content_url: function(ctx) {
    var basepath = path.dirname(ctx.writer.filepath);
    var permalink = ctx.config.permalink;

    return function() {
      var base, url;
      var args = Array.prototype.slice.call(arguments);
      if (/^https?:\/\//.test(args[0])) {
        base = args[0];
        if (base.slice(-1) === '/') {
          base = base.slice(0, -1);
        }
        url = path.join.apply(null, args.slice(1));
      } else {
        url = path.join.apply(null, arguments);
      }
      if (url === '.') url = '';
      url = path.relative(basepath, url);
      url = path.normalize(url).replace(/\\/g, '/');
      url = url.replace(/\\/g, '/');

      if (base) {
        url = base + '/' + url;
      }

      if (url === 'index.html') {
        return './';
      }

      if (url === 'index') {
        return './';
      }

      if (/\/index\.html$/.test(url)) {
        return url.slice(0, -10);
      }

      if (url.slice(-1) === '/') {
        return url;
      }

      var regex = /\.(ht|x)ml$/;
      // fix url with permalink
      if (regex.test(permalink)) {
        if (regex.test(url)) return url;
        // must be endswith characters
        if (/\w$/.test(url)) return url + '.html';
        if (!/\/$/.test(url)) return url + '/';
        return url;
      }

      if (permalink.slice(-1) === '/') {
        if (regex.test(url)) return url.replace(regex, '/');
        if (url.slice(-1) === '/') return url;
        return url + '/';
      }

      if (/\.html$/.test(url)) return url.slice(0, -5);
      return url;
    };
  },

  pagination_url: function(ctx) {
    var basepath = ctx.writer.filepath;
    var permalink = ctx.config.permalink;
    // the directory Separator of windows is \
    var regex = /page[\\\/]\d+(\.html)?$/;
    var url;
    return function(num) {
      if (regex.test(basepath)) {
        url = './' + num + '.html';
      } else {
        url = './page/' + num + '.html';
      }

      if (/\.html$/.test(permalink)) return url;
      return url.replace(/\.html$/, '');
    };
  }
};
