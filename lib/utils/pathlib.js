var os = require('os');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var logging = require('colorful').logging;


exports.isroot = function(str) {
  if (os.type() === 'Windows_NT') {
    return str.slice(1, 3) === ':\\';
  } else {
    return str.charAt(0) === '/';
  }
};

exports.abspath = function(str) {
  if (!exports.isroot(str)) {
    return path.normalize(path.join(process.cwd(), str));
  }
  return str;
};

exports.relative = function(base, filepath) {
  // this relative path is for file system
  if (!base) {
    return filepath;
  }
  var dirname = filepath.replace(base, '');
  if (dirname.charAt(0) === path.sep) {
    dirname = dirname.slice(1);
  }
  if (dirname === '.') return '';
  return dirname;
};

exports.mkdirSync = function(dirname) {
  if (fs.existsSync(dirname)) return;

  var dirs = [];
  while (!fs.existsSync(dirname)) {
    dirs.push(dirname);
    dirname = path.dirname(dirname);
  }
  var mkdir = function(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  };
  dirs.reverse().forEach(mkdir);
};

exports.writeFileSync = function(filepath, data, encoding) {
  if (!fs.existsSync(filepath)) {
    var dirname = path.dirname(filepath);
    exports.mkdirSync(dirname);
  }
  return fs.writeFileSync(filepath, data, encoding);
};

exports.walkdirIgnore = function(root, ignore) {
  ignore = ignore || [];
  ignore = ignore.concat(['.git', '.hg', '.svn', '.DS_Store']);
  return walkdirSync(root, function(fname) {
    return !_.contains(ignore, fname);
  });
};

exports.copy = function(src, dest, files) {
  if (!fs.existsSync(src)) return;
  // src, dest must be abspath
  if (!files) {
    files = exports.walkdirIgnore(src);
  }
  files.forEach(function(item) {
    var stat = fs.statSync(item);
    if (!stat.isFile()) return;
    var content = fs.readFileSync(item);
    var relative = exports.relative(src, item);
    var destination = path.join(dest, relative);
    // TODO
    logging.debug('coping file: %s', relative);
    try {
      exports.writeFileSync(destination, content);
    } catch (e) {
      logging.warn("can't copy %s", item);
    }
  });
};

function walkdirSync(baseDir, filterFn) {
  var files = [];
  var currentFiles, nextDirs;

  currentFiles = fs.readdirSync(baseDir);
  nextDirs = currentFiles.filter(function(fname) {
    if (filterFn && !filterFn(fname)) return false;
    return fs.statSync(path.join(baseDir, fname)).isDirectory();
  });

  currentFiles.forEach(function(fname) {
    if (filterFn && !filterFn(fname)) return;

    var abspath = path.join(baseDir, fname);
    if (fs.statSync(abspath).isFile()) {
      files.push(abspath);
    }
  });

  while (nextDirs.length) {
    files = files.concat(
      walkdirSync(path.join(baseDir, nextDirs.shift()), filterFn)
    );
  }

  return files;
}
exports.walkdirSync = walkdirSync;
