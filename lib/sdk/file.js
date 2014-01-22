var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var rimraf = require('rimraf');
var log = require('./log');
var option = require('./option');

var file = module.exports = {};

file.isroot = function(str) {
  if (process.platform === 'win32') {
    return path.normalize(str).slice(1, 3) === ':\\';
  } else {
    return str.charAt(0) === '/';
  }
};

file.abspath = function(str) {
  if (!file.isroot(str)) {
    return path.normalize(path.join(process.cwd(), path.normalize(str)));
  }
  return str;
};

file.exists = function(filepath) {
  return fs.existsSync(filepath);
};

file.cleanpath = function(filepath) {
  var fpath = path.relative(process.cwd(), filepath);
  return unixifyPath(fpath);
};

file.contain = function(base, filepath) {
  return path.resolve(base).indexOf(path.resolve(filepath)) === 0;
};

file.mkdir = function(dirpath, mode) {
  // get from grunt.file
  if (fs.existsSync(dirpath)) return;

  if (!mode) {
    mode = parseInt('0777', 8) & (~process.umask());
  }
  dirpath.split(path.sep).reduce(function(parts, part) {
    parts += part + '/';
    var subpath = path.resolve(parts);
    if (!fs.existsSync(subpath)) {
      fs.mkdirSync(subpath, mode);
    }
    return parts;
  }, '');
};

file.recurse = function recurse(rootdir, callback, subdir, filter) {
  if (_.isFunction(subdir)) {
    filter = subdir;
    subdir = null;
  }
  filter = filter || option.get('ignorefilter');
  var abspath = subdir ? path.join(rootdir, subdir) : rootdir;
  fs.readdirSync(abspath).forEach(function(filename) {
    var filepath = path.join(abspath, filename);
    if (!fs.existsSync(filepath)) {
      return;
    }
    if (filter && !filter(filepath, subdir, filename)) {
      return;
    }
    // ignore dotfiles
    if (subdir && option.get('ignoredotfiles') !== false && subdir.charAt(0) === '.') {
      return;
    }
    // ignore cachedir directory
    var cachedir = option.get('cachedir');
    if (cachedir && file.contain(file.abspath(cachedir), filepath)) {
      return;
    }
    if (fs.statSync(filepath).isDirectory()) {
      recurse(rootdir, callback, unixifyPath(path.join(subdir || '', filename)), filter);
    } else {
      callback(unixifyPath(filepath), rootdir, subdir, filename);
    }
  });
};

file.list = function(src, filter) {
  var files = [];
  file.recurse(src, function(filepath) {
    files.push(filepath);
  }, filter);
  return files;
};

file.read = function(filepath) {
  log.debug('read', file.cleanpath(filepath));
  var content = fs.readFileSync(filepath, option.get('encoding'));
  if (content.charAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
};

file.readJSON = function(filepath) {
  log.debug('parse', file.cleanpath(filepath));
  try {
    return JSON.parse(file.read(file.abspath(filepath)));
  } catch (e) {
    log.warn('json', e.message);
    return null;
  }
};

file.write = function(filepath, content) {
  log.debug('write', file.cleanpath(filepath));

  var fn = option.get('process_write');
  if (fn) {
    content = fn(content, filepath);
  }

  file.mkdir(path.dirname(filepath));
  return fs.writeFileSync(filepath, content);
};

file.copy = function(src, dest, filter) {
  log.debug('copy', file.cleanpath(src) + ' -> ' + file.cleanpath(dest));

  var fn = option.get('process_copy');

  var copy = function(src, dest) {
    var buf = fs.readFileSync(src);
    file.mkdir(path.dirname(dest));

    if (fn) {
      buf = fn(buf, src);
    }

    fs.writeFileSync(dest, buf);
  };
  if (file.stat(src).isFile()) {
    copy(src, dest);
    return;
  }
  file.recurse(src, function(filepath) {
    var destfile = path.join(dest, path.relative(src, filepath));
    copy(filepath, destfile);
  }, filter);
};

file.rmdir = function(src) {
  log.debug('rmdir', file.cleanpath(src));

  if (file.exists(src)) {
    rimraf.sync(src);
  }
};

file.stat = function(filepath) {
  return fs.statSync(filepath);
};

file.require = function(item) {
  if (!_.isString(item)) return item;

  var basename = path.basename(item);
  var bits = basename.split('.');
  var directory = path.dirname(item);
  if (directory.slice(0, 2) === './') {
    directory = path.join(process.cwd(), directory);
  }
  var mo = require(path.join(directory, _.first(bits)));
  bits = bits.slice(1);
  if (!_.isEmpty(bits)) {
    bits.forEach(function(bit) {
      mo = mo[bit];
    });
  }
  return mo;
};

file.glob = require('glob');

function unixifyPath(filepath) {
  if (process.platform === 'win32') {
    return filepath.replace(/\\/g, '/');
  }
  return filepath;
}
