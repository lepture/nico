/*
 * reader for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 */

var fs = require('fs');
var util = require('util');
var path = require('path');
var moment = require('moment');
var rs = require('robotskirt');
var Class = require('arale').Class;
var _ = require('underscore');
var highlight = require('highlight.js');
var utils = require('./utils');
var urilab = require('./utils/uri');
var pathlib = require('./utils/path');
var logging = require('colorful').logging;


function Post(obj) {
  this.filepath = obj.filepath;
  this.relative_filepath = pathlib.relative(obj.root, this.filepath);
  this.parser = obj.parser || new MarkdownParser();

  var content = obj.content;
  if (!content) {
    logging.debug('reading content from %s', this.relative_filepath);
    content = fs.readFileSync(this.filepath, 'utf8');
  }
  var parsed = parseContent(content);
  this.header = parsed.header;
  this.body = parsed.body;
  this.title = obj.title || this.meta.title;

  if (!this.title) {
    logging.warn('no title of %s', this.relative_filepath);
  } else {
    logging.debug('find post: %s', this.title);
  }
}

Object.defineProperty(Post.prototype, 'id', {
  configurable: true,
  get: function() {
    if (!this.directory) return this.filename;
    var bits = this.directory.split(path.sep);
    bits.push(this.filename);
    return bits.join('-');
  }
});

Object.defineProperty(Post.prototype, 'meta', {
  get: function() {
    if (this._meta) return this._meta;
    this._meta = this.parser.meta(this.header);
    return this._meta;
  }
});

Object.defineProperty(Post.prototype, 'pubdate', {
  configurable: true,
  set: function(date) {
    this._meta.pubdate = new moment(date, 'YYYY-MM-DD HH:mm:ss');
  },
  get: function() {
    if (!this.meta.pubdate) return null;
    return new moment(this.meta.pubdate, 'YYYY-MM-DD HH:mm:ss');
  }
});

Object.defineProperty(Post.prototype, 'updated', {
  configurable: true,
  get: function() {
    if (this.meta.updated) {
      return new moment(this.meta.updated, 'YYYY-MM-DD HH:mm:ss');
    }
    return new moment(fs.statSync(this.filepath).mtime);
  }
});

Object.defineProperty(Post.prototype, 'status', {
  get: function() {
    if (!this.meta.status) return 'public';
    return this.meta.status;
  }
});

Object.defineProperty(Post.prototype, 'tags', {
  configurable: true,
  get: function() {
    if (!this.meta.tags) return [];
    var ret = [];
    var tags = this.meta.tags.split(',');
    tags.forEach(function(tag) {
      ret.push(tag.trim());
    });
    return ret;
  }
});

Object.defineProperty(Post.prototype, 'html', {
  configurable: true,
  get: function() {
    return this.parser.html(this.body, this.id);
  }
});

Object.defineProperty(Post.prototype, 'iframes', {
  configurable: true,
  get: function() {
    return this.parser.iframes(this.body, this.id);
  }
});

Object.defineProperty(Post.prototype, 'toc', {
  configurable: true,
  get: function() {
    return this.parser.toc(this.body);
  }
});

Object.defineProperty(Post.prototype, 'filename', {
  configurable: true,
  get: function() {
    if (this.meta.filename) return this.meta.filename;
    var basename = path.basename(this.relative_filepath);
    var extname = path.extname(this.relative_filepath);
    return basename.slice(0, -extname.length);
  }
});

Object.defineProperty(Post.prototype, 'directory', {
  configurable: true,
  get: function() {
    if (this.meta.directory) return this.meta.directory;
    var dirname = path.dirname(this.relative_filepath);
    if (dirname === '.') return '';
    return dirname;
  }
});

Object.defineProperty(Post.prototype, 'template', {
  configurable: true,
  get: function() {
    return this.meta.template || null;
  }
});

Object.defineProperty(Post.prototype, 'description', {
  configurable: true,
  get: function() {
    return this.meta.description || '';
  }
});



exports.Post = Post;

var MarkdownParser = Class.create({
  meta: function(content) {
    var parser = new rs.Markdown(new rs.HtmlRenderer());
    var html = parser.render(content);
    var m = html.match(/<h1>(.*?)<\/h1>/);
    var meta = {};
    if (!m) {
      meta.title = null;
    } else {
      meta.title = m[1];
    }
    var items = [];
    var regex = /<li>(.*?)<\/li>/g;
    utils.match(regex, html, function(m) {
      items.push(m[1]);
    });
    if (items) {
      items.forEach(function(item) {
        var splits = item.split(':');
        var key = splits[0].trim();
        var value = splits.slice(1).join(':').trim();
        meta[key] = value;
      });
    }
    items = html.match(/<p>(.*?)<\/p>/g);
    if (items) {
      meta.description = items.join('\n');
    }
    return meta;
  },
  html: function(content, id) {
    content = content.replace(/^````(\w+)/gm, '````$1+');
    content = content.replace(/^`````(\w+)/gm, '`````$1-');
    return getHtml(content, id);
  },
  iframes: function(content, id) {
    return getIframes(content, id);
  },
  toc: function(content) {
    var toc = getToc(content);
    if (_.isEmpty(toc)) return '';
    var html = '<ul>';
    var begin, last;
    toc.forEach(function(item) {
      if (!begin) {
        begin = item.level;
        last = item.level;
      }
      if (item.level < begin) return;
      if (Math.abs(item.level - last) > 1 ) return;
      // equal
      if (item.level === last) {
        html += util.format('<li><a href="#%s">%s</a></li>', item.id, item.text);
      }
      // indent
      if (item.level > last) {
        html = html.slice(0, -5);
        html += util.format('<ul><li><a href="#%s">%s</a></li>', item.id, item.text);
      }
      // unident
      if (item.level < last) {
        html += util.format('</ul></li><li><a href="#%s">%s</a></li>', item.id, item.text);
      }
      last = item.level;
    });
    _(last - begin + 1).times(function() {
      html += '</ul>';
    });
    return html;
  }
});

exports.MarkdownParser = MarkdownParser;

// helpers

function parseContent(content) {
  var lines = content.split(/\r\n|\r|\n/);
  var header = [];
  var body = [];
  var recording = true;
  lines.forEach(function(line) {
    if (recording && line.slice(0, 3) === '---') {
      recording = false;
    } else if (recording) {
      header.push(line);
    } else {
      body.push(line);
    }
  });
  return {header: header.join('\n'), body: body.join('\n')};
}

function getToc(content) {
  var renderer = new rs.HtmlRenderer();
  var toc = [];
  renderer.header = function(text, level) {
    var id = urilab.encode(text);
    toc.push({id: id, text: text, level: level});
    return util.format('<h%d id="%s">%s</h%d>', level, id, text, level);
  };
  var parser = new rs.Markdown(renderer);
  parser.render(content);
  return toc;
}


function getHtml(content, id) {
  var renderer = new rs.HtmlRenderer([rs.HTML_USE_XHTML]);
  var count = 0;

  renderer.blockcode = function(code, language) {
    if (!language || language === '+' || language === '-') {
      return '\n<pre>' + rs.houdini.escapeHTML(code) + '</pre>\n';
    }

    var indicate = language.slice(-1);
    var hide = indicate === '-';
    var inject = indicate === '-' || indicate === '+';
    if (inject) {
      language = language.slice(0, -1);
    }
    var shortcuts = {
      'js': 'javascript',
      'json': 'javascript',
      'py': 'python',
      'rb': 'ruby',
      'md': 'markdown',
      'mkd': 'markdown',
      'c++': 'cpp'
    };
    if (language in shortcuts) {
      language = shortcuts[language];
    }
    inject = inject && ['javascript', 'css', 'html'].indexOf(language) !== -1;
    var html = '';

    // iframe hack
    if (language.slice(0, 6) === 'iframe') {
      count = count + 1;
      var height = language.split(':')[1];
      if (height) {
        height = 'height="' + height + '"';
      }
      html = [
        '<div class="nico-iframe">',
        '<iframe src="iframe-%s-%d.html" allowtransparency="true" ',
        'frameborder="0" scrolling="0" %s></iframe></div>'
      ].join('\n');
      html = util.format(html, id, count, height);
      language = 'html';
    }

    if (inject) {
      if (language === 'javascript') {
        html = util.format('\n<script>\n%s</script>\n', code);
      } else if (language === 'css') {
        html = util.format('\n<style type="text/css">%s</style>\n', code);
      } else {
        html = util.format('\n<div class="nico-insert-code">%s</div>\n', code);
      }
    }
    if (hide && inject) {
      return html;
    }
    if (language === 'html') {
      language = 'xml';
    }
    if (!highlight.LANGUAGES.hasOwnProperty(language)) {
      return '\n<pre>' + rs.houdini.escapeHTML(code) + '</pre>\n';
    }
    code = highlight.highlight(language, code).value;
    html += util.format(
      '<div class="highlight"><pre><code class="%s">%s</code></pre></div>',
      language, code
    );
    return html;
  };

  renderer.header = function(text, level) {
    var id = urilab.encode(text);
    return util.format('<h%d id="%s">%s</h%d>', level, id, text, level);
  };

  var parser = new rs.Markdown(
    renderer,
    [
      rs.EXT_FENCED_CODE, rs.EXT_TABLES,
      rs.EXT_AUTOLINK, rs.EXT_NO_INTRA_EMPHASIS,
      rs.EXT_STRIKETHROUGH
    ]
  );
  return parser.render(content);
}

function getIframes(content, id) {
  var renderer = new rs.HtmlRenderer();
  var count = 0;
  var iframes = {};

  renderer.blockcode = function(code, language) {
    if (!language) return '';
    if (language.slice(0, 6) === 'iframe') {
      count += 1;
      iframes['iframe-' + id + '-' + count] = code;
    }
  };

  var parser = new rs.Markdown(renderer, [rs.EXT_FENCED_CODE]);
  parser.render(content);
  return iframes;
}
