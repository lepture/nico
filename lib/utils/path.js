var os = require('os');
var fs = require('fs');
var path = require('path');
var logging = require('colorful').logging;


exports.isroot = function(str) {
  if (os.type() === 'Windows_NT') {
    return str.slice(1, 3) === ':\\';
  } else {
    return str.slice(0, 1) === '/';
  }
};

exports.relative = function(base, filepath) {
  // this relative path is for file system
  if (!base) {
    return filepath;
  }
  var dirname = filepath.replace(base, '');
  if (dirname.charAt(0) == path.sep) {
    dirname = dirname.slice(1);
  }
  if (dirname === '.') return '';
  return dirname;
};


// file system utils
exports.safeWrite = function(filepath) {
  if (fs.existsSync(filepath)) return;
  var dirs = [];
  var dirname = path.dirname(filepath);
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


exports.walkdir = function(root, ignore) {
  ignore = ignore || [];
  ignore = ignore.concat(['.git', '.hg', '.svn', '.DS_Store']);
  var walker = new Walker(root, ignore);
  walker.scan();
  return walker;
};

exports.copy = function(src, dest, files) {
  if (!fs.existsSync(src)) return;
  // src, dest must be abspath
  if (!files) {
    files = exports.walkdir(src).files;
  }
  files.forEach(function(item) {
    var stat = fs.statSync(item);
    if (!stat.isFile()) return;
    var content = fs.readFileSync(item);
    var relative = exports.relative(src, item);
    var destination = path.join(dest, relative);
    // TODO
    logging.debug('coping file: %s', relative);
    exports.safeWrite(destination);
    try {
      fs.writeFileSync(destination, content);
    } catch (e) {
      logging.warn("can't copy %s", item);
    }
  });
};

function Walker(root, ignore) {
  this.root = root;
  this.ignore = ignore || [];
  this.dirs = [];
  this.files = [];
}

Walker.prototype.scan = function(root) {
  if (!root) root = this.root;
  var indirs = fs.readdirSync(root);
  var self = this;
  indirs.forEach(function(item) {
    if (!item) return;
    var abspath = path.join(root, item);
    if (abspath == root) return;
    var stat = fs.statSync(abspath);
    if (stat.isDirectory()) {
      if (self.ignore.indexOf(item) == -1) {
        self.dirs.push(abspath);
        self.scan(abspath);
      }
    } else if (stat.isFile()) {
      if (self.ignore.indexOf(item) == -1) {
        self.files.push(abspath);
      }
    }
  });
};
