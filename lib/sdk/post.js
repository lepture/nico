var rs = require('robotskirt');
var md = require('./markdown');
var log = require('./log');
var file = require('./file');
var _ = require('underscore');
var path = require('path');

var cachedir = '.build';
// cache file in .json format

exports.sourcedir = 'content';
exports.reader = null;

exports.read = function(filepath) {
  var key = file.cleanpath(filepath) + '.json';
  var cachefile = path.join(cachedir, key);
  if (file.exists(cachefile)) {
    return file.readJSON(cachefile, true);
  }
  filepath = file.abspath(filepath);
  var content = file.read(filepath);
  var post = parseContent(content);
  post.meta.filepath = filepath;
  // save cache
  index(post);
  return post;
};

exports.index = function index(post) {
  if (!post || !post.meta || !post.meta.filepath) return;

  if (!post.meta.pubdate) {
    cacheindex = path.join(cachedir, 'pages.json');
  }

  var toIndex = false;
  var key = file.cleanpath(post.filepath) + '.json';
  var cachepost = path.join(cachedir, key);
  if (file.exists(cachepost)) {
    var mtimeCache = file.stat(cachepost).mtime;
    if (file.stat(post.meta.filepath).mtime > mtimeCache) {
      toIndex = true;
      log.debug('post', 'modified ' + post.title);
    }
  } else {
    toIndex = true;
  }
  if (!data[key] || toIndex) {
    data[key] = {title: post.title, meta: post.meta};
    file.write(cachepost, JSON.stringify(post));
    file.write(cacheindex, JSON.stringify(data));
  }
  return data;
};

exports.list = function list(type) {
  // list all posts | pages | files in the cache
  var cachefile;
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
  return {meta: meta, raw: body.join('\n')};
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

function readIt(post) {
  var reader = exports.reader;
  if (reader) {
    if (_.isFunction(reader)) {
      return reader(post);
    } else if (_.isString(reader)) {
      return file.require(reader)(post)
    }
  }
  // use default reader
}
