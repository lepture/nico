var rs = require('robotskirt');
var format = require('util').format;
var md = require('./markdown');
var log = require('./log');
var file = require('./file');
var option = require('./option');
var _ = require('underscore');
var path = require('path');

// types
// -----
// posts: a markdown file that has a pubdate meta info
// writers: a markdown file that has a writer meta info
// pages: a markdown file that is not posts or writers
// files: not a markdown file

exports.read = function(filepath, fromCache) {
  var cachefile = inCache(filepath);
  var post;
  if (cachefile && fromCache !== false) {
    // read cache file in .json format
    post = file.readJSON(cachefile, true);
    if (post.pubdate) post.pubdate = new Date(post.pubdate);
    return post;
  }
  filepath = file.abspath(filepath);
  var content = file.read(filepath);
  post = parseContent(content);

  // enhance post information
  post.filepath = filepath;
  post.filename = post.meta.filename ||
    path.basename(filepath).replace(/\.(md|mkd|markdown)$/, '');
  if (post.meta.directory) {
    post.directory = post.meta.directory;
  } else {
    post.directory = path.dirname(
      file.relative(file.abspath(option.get('sourcedir')), filepath)
    )
  }
  if (post.directory === '.') post.directory = '';
  var id = post.directory.replace(/\\/g, '-') + '-' + post.filename;
  id = id.replace(/\\/g, '-');
  id = id.replace(/\s+/g, '-');
  post.id = id.replace(/\-{1,}/g, '-');

  post.tags = [];
  if (post.meta.tags) {
    post.meta.tags.split(',').forEach(function(tag) {
      post.tags.push(tag.trim());
    });
  }
  if (post.meta.pubdate) {
    post.pubdate = new Date(post.meta.pubdate);
  }
  post.status = post.meta.status || 'public';

  // markdown parse everything
  post.html = md.render(post.body);
  post.toc = parseToc(post.body);
  post.iframes = md.iframes(post.body);

  // user can customize post
  post = runReader(post);
  return post;
};

exports.index = function index(post) {
  if (!post || !post.filepath) return;

  var cachedir = option.option('cachedir');
  if (!post.meta.pubdate) {
    cacheindex = path.join(cachedir, 'pages.json');
  }
  if (post.meta.writer) {
    cacheindex = path.join(cachedir, 'writers.json');
  }

  var key = file.cleanpath(post.filepath) + '.json';
  file.write(path.join(cachedir, key), JSON.stringify(post));

  var data = {};
  if (file.exists(cacheindex)) {
    data = file.readJSON(cacheindex);
  }
  data[key] = {title: post.title, meta: post.meta};
  file.write(cacheindex, JSON.stringify(data));
  return data;
};

exports.load = function load() {
  var sourcedir = option.option('sourcedir');
  var cachedir = option.option('cachedir');
  var runtimefile = path.join(cachedir, 'runtime.json');
  var post, assets = {};
  file.recurse(sourcedir, function(filepath) {
    if (!/\.(md|mkd|markdown)$/.test(filepath)) {
      // this is files
      assets[file.cleanpath(filepath)] = filepath;
      return;
    }
    if (file.stat(filepath).mtime > file.stat(runtimefile).mtime) {
      // don't read from cache
      post = exports.read(filepath, false);
      // cache it
      if (post.meta && post.meta.status !== 'draft') {
        log.debug('post', 'modified ' + post.title);
        index(post);
      }
    }
  });
  // index assets
  file.write(path.join(cachedir, 'files.json'), JSON.stringify(assets));
};

exports.list = function list(type) {
  // list all posts | pages | files in the cache
  var cachefile, cachedir = option.option('cachedir');
  if (type && type === 'pages') {
    cachefile = path.join(cachedir, 'pages.json');
    if (file.exists(cachefile)) {
      return _.values(file.readJSON(cachefile));
    }
    return [];
  }
  if (type && type === 'files') {
    cachefile = path.join(cachedir, 'files.json');
    if (file.exists(cachefile)) {
      return _.values(file.readJSON(cachefile));
    }
    return [];
  }
  cachefile = path.join(cachedir, 'posts.json');
  if (!file.exists(cachefile)) {
    return [];
  }
  var ret = _.values(file.readJSON(cachefile));
  // TODO reverse ?
  return ret.sort(function(a, b) {
    return new Date(a.meta.pubdate) - new Date(b.meta.pubdate);
  });
};

exports.paginate = function(page, perpage) {
  perpage = perpage || 20;

  var total_items = list('posts');
  var total = total_items.length;

  var start = (page - 1) * perpage
  var end = page * perpage;
  var items = total_items.slice(start, end);
  items = items.map(function(item) {
    return exports.read(item.meta.filepath);
  });

  var pages = parseInt((total - 1) / perpage, 10) + 1;

  var iter_pages;
  var edge = 4;
  if (page <= edge) {
    iter_pages = _.range(1, Math.min(pages, 2 * edge + 1) + 1);
  } else if (page + edge > pages) {
    iter_pages = _.range(Math.max(pages - 2 * edge, 1), pages + 1);
  } else {
    iter_pages = _.range(page - edge, Math.min(pages, page + edge) + 1);
  }

  var ret = {
    page: page,
    perpage: perpage,

    total_items: total_items,
    total: total,
    items: items,

    has_prev: page < pages,
    prev_num: page - 1,
    has_next: page > 1,
    next_num: page + 1,
    iter_pages: iter_pages
  };
  return ret;
};


function inCache(filepath) {
  var key = file.cleanpath(filepath) + '.json';
  var cachefile = path.join(option.option('cachedir'), key);
  if (file.exists(cachefile)) {
    return cachefile;
  }
  return null;
}

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
  var meta = parseMeta(header.join('\n'));
  if (!meta.title) {
    log.debug('post', 'title is missing');
  }
  return {title: meta.title, meta: meta, body: body.join('\n')};
}
exports.parse = parseContent;

function parseMeta(content) {
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
}

function parseToc(content) {
  var toc = md.toc(content, option.get('tocLevel'));
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
      html += format('<li><a href="#%s">%s</a></li>', item.id, item.text);
    }
    // indent
    if (item.level > last) {
      html = html.slice(0, -5);
      html += format('<ul><li><a href="#%s">%s</a></li>', item.id, item.text);
    }
    // unident
    if (item.level < last) {
      html += format('</ul></li><li><a href="#%s">%s</a></li>', item.id, item.text);
    }
    last = item.level;
  });
  _(last - begin + 1).times(function() {
    html += '</ul>';
  });
  return html;
}


function runReader(post) {
  var reader = option.get('reader');
  if (!reader) return post;
  if (_.isString(reader)) reader = file.require(reader);
  if (_.isFunction(reader)) return reader(post);
  return post;
}
