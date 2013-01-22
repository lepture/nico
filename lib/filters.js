var path = require('path');
var moment = require('moment');
var rs = require('robotskirt');
var hl = require('highlight.js');
var format = require('util').format;
var utils = require('./utils');
var urilib = require('./utils/urilib');


exports.filters = {
  xmldatetime: function(m) {
    if (moment.isMoment(m)) {
      return m.format('YYYY-MM-DDTHH:mm:ssZ');
    }
    return m;
  },
  markdown: function(text) {
    var renderer = new rs.HtmlRenderer([rs.HTML_USE_XHTML]);
    var parser = new rs.Markdown(
      renderer,
      [
        rs.EXT_FENCED_CODE, rs.EXT_TABLES,
        rs.EXT_AUTOLINK, rs.EXT_NO_INTRA_EMPHASIS,
        rs.EXT_STRIKETHROUGH
      ]
    );
    return parser.render(text);
  },
  highlight: function(code, language) {
    var shortcuts = {
      'js': 'javascript',
      'json': 'javascript',
      'html': 'xml',
      'py': 'python',
      'rb': 'ruby',
      'md': 'markdown',
      'mkd': 'markdown',
      'c++': 'cpp'
    };

    if (language && shortcuts.hasOwnProperty(language)) {
      language = shortcuts[language];
    }

    if (!language || !hl.LANGUAGES.hasOwnProperty(language)) {
      return '\n<pre>' + rs.houdini.escapeHTML(code) + '</pre>\n';
    }
    code = hl.highlight(language, code).value;
    return format(
      '<div class="highlight"><pre><code class="%s">%s</code></pre></div>',
      language, code
    );
  }
};


exports.functions = {
};


exports.contextfunctions = {
  permalink_url: function(ctx) {
    var basepath = ctx.writer.filepath;

    return function(post) {
      var url = utils.destination(post, ctx.config.permalink);
      url = urilib.relative(basepath, url);
      if (/\/index.html$/.test(url)) {
        return url.slice(0, -10);
      }
      return url;
    };
  },

  static_url: function(ctx) {
    var basepath = ctx.writer.filepath;

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
      url = urilib.relative(basepath, url);
      return url;
    };
  },

  content_url: function(ctx) {
    var basepath = ctx.writer.filepath;
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
      url = urilib.relative(basepath, url);
      url = path.normalize(url).replace(/\\/g, '/');

      if (base) {
        url = base + '/' + url;
      }

      if (url === 'index.html') {
        return './';
      }

      if (/\/index.html$/.test(url)) {
        return url.slice(0, -10);
      }

      if (url.slice(-1) === '/') {
        return url;
      }

      var regex = /\.(ht|x)ml$/;
      // fix url with permalink
      if (regex.test(permalink)) {
        if (regex.test(url)) return url;
        return url + '.html';
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
    var regex = /page\/\d+(\.html)?$/;
    var url;
    return function(num) {
      if (regex.test(basepath)) {
        url = './' + num + '.html';
      } else {
        url = './page/' + num + '.html';
      }
      if (/\.html$/.test(permalink)) return url;
      return url.replace(/\.html$/, '')
    }
  }
};
