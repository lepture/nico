var format = require('util').format;
var encode = require('./encode');
var md = require('./markdown');
var log = require('./log');
var file = require('./file');
var option = require('./option');
var events = require('./events');
var _ = require('underscore');
var path = require('path');


exports.permalink = function(item, format) {
  // generate the destination of a post via permalink style
  var findValue = function(key) {
    var bits = key.split('.');
    var value = item;
    for (var i = 0; i < bits.length; i++) {
      value = value[bits[i]];
      if (!value) return '';
    }
    if (!value) return '';
    if (typeof value === 'function') value = value();
    if (typeof value === 'number' && value < 10) {
      return '0' + value;
    }
    return value;
  };
  var regex = /\{\{(.*?)\}\}/g;

  var ret = format;
  var match = regex.exec(format);
  while (match) {
    ret = ret.replace(match[0], findValue(match[1]));
    match = regex.exec(format);
  }
  if (!ret) {
    return ret;
  }
  ret = encode.filepath(ret);
  ret = ret.replace(/\\\\/g, '/');
  if (/^\//.test(ret)) {
    ret = ret.slice(1);
  }
  return ret;
};

// types
// -----
// posts: a markdown file that has a pubdate meta info
// writers: a markdown file that has a writer meta info
// pages: a markdown file that is not posts or writers
// files: not a markdown file

exports.read = function(filepath, fromCache) {
  events.emit('reading', filepath);

  var cachefile = inCache(filepath);
  var post;
  if (cachefile && fromCache !== false) {
    // read cache file in .json format
    post = file.readJSON(cachefile, true);
    if (post.pubdate) post.pubdate = new Date(post.pubdate);
    events.emit('read', post);
    return post;
  }
  filepath = file.abspath(filepath);
  var content = file.read(filepath);
  post = parseContent(content);

  // enhance post information
  post.abspath = filepath;
  post.filepath = post.meta.filepath = file.cleanpath(filepath);
  post.filename = post.meta.filename = post.meta.filename ||
    path.basename(filepath).replace(/\.(md|mkd|markdown)$/, '');
  if (post.meta.directory) {
    post.directory = post.meta.directory;
  } else {
    post.directory = post.meta.directory = path.dirname(
      path.relative(file.abspath(option.get('sourcedir')), filepath)
    );
  }
  if (post.directory === '.') post.directory = post.meta.directory = '';
  var id = [post.directory.replace(/\\/g, '-'), post.filename].join('-');
  post.id = post.meta.id = encode.uri(id);

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
  events.emit('read', post);
  return post;
};

exports.index = function(post) {
  if (!post || !post.filepath) return;
  events.emit('indexing', post);

  var filepath = post.filepath;
  log.debug('cache', post.filepath);

  var indexfiles = {
    posts: option.get('cache:posts'),
    pages: option.get('cache:pages'),
    writers: option.get('cache:writers')
  };

  var cachetype = 'posts';
  if (!post.meta.pubdate) {
    cachetype = 'pages';
  }
  if (post.meta.writer) {
    cachetype = 'writers';
  }

  var data = {};
  Object.keys(indexfiles).forEach(function(key) {
    var filepath = indexfiles[key];
    var ret = file.exists(filepath) ? file.readJSON(filepath) : {};
    if (key !== cachetype && ret[filepath]) {
      delete ret[filepath];
      file.write(filepath, JSON.stringify(ret));
    }
    if (key === cachetype) {
      data = ret;
    }
  });

  var cachefile = option.get('cache:' + filepath);
  if (file.exists(cachefile)) {
    events.emit('changed', post);
  } else {
    events.emit('new', post);
  }
  file.write(cachefile, JSON.stringify(post));

  var ret = {};
  ['title', 'id', 'pubdate', 'tags', 'filepath', 'meta'].forEach(function(key) {
    if (post.hasOwnProperty(key)) {
      ret[key] = post[key];
    }
  });
  data[filepath] = ret;
  file.write(indexfiles[cachetype], JSON.stringify(data));
  events.emit('indexed', post);
  return data;
};

exports.load = function(sourcedir) {
  if (sourcedir) {
    option.set('sourcedir', sourcedir);
  } else {
    sourcedir = option.option('sourcedir');
  }
  events.emit('loading', sourcedir);

  var runtimefile = option.get('cache:runtime');
  var post, assets = {};

  // runtime data
  var runtime = {};
  if (file.exists(runtimefile)) {
    runtime = file.readJSON(runtimefile);
  }
  var cachetag = option.get('cachetag');

  file.recurse(sourcedir, function(filepath) {
    if (!/\.(md|mkd|markdown)$/.test(filepath)) {
      // this is files
      assets[file.cleanpath(filepath)] = filepath;
      return;
    }
    if (!file.exists(runtimefile) || !runtime.loaded ||
        file.stat(filepath).mtime > new Date(runtime.loaded) ||
        runtime.cachetag !== cachetag) {
      // don't read from cache
      post = exports.read(filepath, false);
      exports.index(post);
    }
  });
  // index assets
  file.write(option.get('cache:files'), JSON.stringify(assets));

  runtime.loaded = new Date();
  runtime.nico = require('../../package').version;
  if (runtime.cachetag !== cachetag) {
    option.set('__rebuild', true);
  }
  runtime.cachetag = cachetag;
  file.write(runtimefile, JSON.stringify(runtime));

  events.emit('loaded', sourcedir);
  return true;
};

exports.fetch = function(type) {
  // list all posts | pages | files in the cache
  var cachefile;
  if (type && type === 'pages') {
    cachefile = option.get('cache:pages');
    if (file.exists(cachefile)) {
      return file.readJSON(cachefile);
    }
    return {};
  }
  if (type && type === 'files') {
    cachefile = option.get('cache:files');
    if (file.exists(cachefile)) {
      return _.values(file.readJSON(cachefile));
    }
    return {};
  }
  cachefile = option.get('cache:posts');
  if (!file.exists(cachefile)) {
    return {};
  }
  return file.readJSON(cachefile);
};

exports.paginate = function(page, total_items) {
  var perpage = option.get('perpage') || 20;

  total_items = total_items || list('posts');
  var total = total_items.length;

  var start = (page - 1) * perpage;
  var end = page * perpage;
  var items = total_items.slice(start, end);
  items = items.map(function(item) {
    return exports.read(item.filepath);
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
    pages: pages,
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
  var cachefile = option.get('cache:' + file.cleanpath(filepath));
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
    var html = md.markdown(content);
    var m = html.match(/<h1>(.*?)<\/h1>/);
    var meta = {};
    if (!m) {
      meta.title = null;
    } else {
      meta.title = m[1];
    }
    var items = [];
    var regex = /<li>(.*?)<\/li>/g;

    var match = regex.exec(html);
    while (match) {
      items.push(match[1]);
      match = regex.exec(html);
    }

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
    if (Math.abs(item.level - last) > 1) return;
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
      html += format(
        '</ul></li><li><a href="#%s">%s</a></li>', item.id, item.text
      );
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
