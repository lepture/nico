var path = require('path');
var _ = require('underscore');
var log = require('./log');

var file = module.exports = {};

file.encoding = 'utf8';
file.ignorecvs = true;

file.isroot = function(str) {
  if (os.type() === 'Windows_NT') {
    return str.slice(1, 3) === ':\\';
  } else {
    return str.charAt(0) === '/';
  }
};

file.abspath = function(str) {
  if (!exports.isroot(str)) {
    return path.normalize(path.join(process.cwd(), str));
  }
  return str;
};

file.exists = function(filepath) {
  return fs.existsSync(filepath);
};

file.cleanpath = function(filepath) {
  var fpath = path.relative(process.cwd(), path.normalize(filepath));
  return unixifyPath(fpath);
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
  var abspath = subdir ? path.join(rootdir, subdir) : rootdir;
  fs.readdirSync(abspath).forEach(function(filename) {
    var filepath = path.join(abspath, filename);
    if (filter && filter(filepath, subdir, filename)) {
      return true;
    }
    if (file.ignorecvs && /^\.(git|hg|svn)$/.test(subdir)) {
      return true;
    }
    // ignore build directory
    if (subdir === '.build') {
      return true;
    }
    if (fs.statSync(filepath).isDirectory()) {
      recurse(rootdir, callback, unixifyPath(path.join(subdir, filename)), filter);
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

file.read = function(filepath, ignore) {
  log.debug('read', file.cleanpath(filepath));
  return fs.readFileSync(filepath, file.encoding);
};

file.readJSON = function(filepath, ignore) {
  // use comptable rather than parse json
  if (!ignore) log.debug('json', file.cleanpath(filepath));
  try {
    return require(file.abspath(filepath));
  } catch (e) {
    log.warn('json', e.message)
    return null;
  }
};

file.write = function(filepath, content) {
  log.debug('write', file.cleanpath(filepath));
  return fs.writeFileSync(filepath, content);
};

file.copy = function(src, dest, filter) {
  log.debug('copy', file.cleanpath(src) + ' -> ' + file.cleanpath(dest));
  file.recurse(src, function(filepath) {
    var destfile = path.join(dest, path.relative(src, filepath));
    var content = fs.readFileSync(filepath, file.encoding);
    fs.writeFileSync(destfile, content);
  }, filter);
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
  var module = require(path.join(directory, _.first(bits)));
  bits = bits.slice(1);
  if (!_.isEmpty(bits)) {
    bits.forEach(function(bit) {
      module = module[bit];
    });
  }
  return module;
};


function unixifyPath(filepath) {
  if (process.platform === 'win32') {
    return filepath.replace(/\\/g, '/');
  }
  return filepath;
}
