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
var highlight = require('highlight.js');
var utils = require('./utils');


function Post(filepath, root, parser) {
  this.filepath = filepath;
  this.relative_filepath = utils.relativePath(filepath, root);
  this.parser = parser || new MarkdownParser();
  this.content = fs.readFileSync(filepath, 'utf8');

  var parsed = parseContent(this.content);
  this.header = parsed.header;
  this.body = parsed.body;
  this.title = this.meta.title;
  return this;
}
Object.defineProperty(Post.prototype, 'id', {
  get: function() {
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
  set: function(date) {
    this._meta.pubdate = moment(date).clone();
  },
  get: function() {
    if (!this.meta.pubdate) return null;
    return moment(this.meta.pubdate).clone();
  }
});

Object.defineProperty(Post.prototype, 'updated', {
  get: function() {
    if (this.meta.updated) return moment(this.meta.updated).clone();
    return moment(fs.statSync(this.filepath).mtime).clone();
  }
});

Object.defineProperty(Post.prototype, 'status', {
  get: function() {
    if (!this.meta.status) return 'public';
    return this.meta.status;
  }
});

Object.defineProperty(Post.prototype, 'tags', {
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
  get: function() {
    return this.parser.html(this.body, this.id);
  }
});

Object.defineProperty(Post.prototype, 'iframes', {
  get: function() {
    return this.parser.iframes(this.body, this.id);
  }
});


Object.defineProperty(Post.prototype, 'toc', {
  get: function() {
    return this.parser.toc(this.body);
  }
});

Object.defineProperty(Post.prototype, 'filename', {
  get: function() {
    if (this.meta.filename) return this.meta.filename;
    var basename = path.basename(this.relative_filepath);
    return basename.split('.')[0];
  }
});

Object.defineProperty(Post.prototype, 'directory', {
  get: function() {
    if (this.meta.directory) return this.meta.directory;
    return path.dirname(this.relative_filepath);
  }
});

Object.defineProperty(Post.prototype, 'template', {
  get: function() {
    return this.meta.template || null;
  }
});


exports.Post = Post;

function MarkdownParser() {
}

MarkdownParser.prototype.meta = function(content) {
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
};
MarkdownParser.prototype.html = function(content, id) {
  content = content.replace(/^````(\w+)/gm, '````$1+');
  content = content.replace(/^`````(\w+)/gm, '`````$1-');
  return getHtml(content, id);
};
MarkdownParser.prototype.iframes = function(content, id) {
  return getIframes(content, id);
};
MarkdownParser.prototype.toc = function(content) {
  return getToc(content);
};

exports.MarkdownParser = MarkdownParser;

// helpers

function parseContent(content) {
  var lines = content.split(/\r\n|\r|\n/);
  var header = [];
  var body = [];
  var recording = true;
  lines.forEach(function(line) {
    if (recording && line.slice(0, 3) == '---') {
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
    var id = text.match(/\w+/g).join('-').toLowerCase();
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
    var hide = indicate == '-';
    var inject = indicate == '-' || indicate == '+';
    if (inject) {
      language = language.slice(0, -1);
    }
    var shortcuts = {
      'js': 'javascript',
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
      var width = language.slice(7);
      if (width) {
        width = 'width="' + width + '"';
      }
      html = [
        '<div class="nico-iframe">',
        '<iframe src="iframe-%s-%d.html" allowtransparency="true" ',
        'frameborder="0" scrolling="0" %s></iframe></div>'
      ].join('\n');
      html = util.format(html, id, count, width);
      language = 'html';
    }

    if (inject) {
      if (language === 'javascript') {
        html = util.format('\n<script>\n%s</script>\n', code);
      } else if (language === 'css') {
        html = util.format('\n<style type="text/css">%s</style>\n', code);
      } else {
        html = util.format('\n<div class="nico-insert-code">%s</div>\n', code);
        language = 'xml';
      }
    }
    if (hide && inject) {
      return html;
    }
    html += highlight.highlight(language, code).value;
    return html;
  };

  renderer.header = function(text, level) {
    var id = text.match(/\w+/g).join('-').toLowerCase();
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

    var indicate = language.slice(-1);
    if (indicate === '-' || indicate === '+') {
      language = language.slice(0, -1);
    }
    if (language.slice(0, 6) === 'iframe') {
      count += 1;
      iframes['iframe-' + id + '-' + count] = code;
    }
  };

  var parser = new rs.Markdown(renderer);
  parser.render(content);
  return iframes;
}
