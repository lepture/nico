var fs = require('fs');
var path = require('path');
var os = require('os');
var child_process = require('child_process');
var colorful = require('colorful');
var _ = require('underscore');

exports.logging = new colorful.Logging();

exports.encodeURIComponent = function(text) {
    var regex = /[^,\.<>\/\?;\:'"\[\]\{\}\\\|`~!@#\$%\^\&\*\(\)\_\+\=\s]+/g;
    text = text.match(regex).join('-').toLowerCase();
    return encodeURIComponent(text);
};

exports.isroot = function(str) {
  if (os.type() === 'Windows_NT') {
    return str.slice(1, 3) === ':\\';
  } else {
    return str.slice(0, 1) === '/';
  }
};

exports.require = function(item) {
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


exports.relativePath = function(filepath, root) {
  // this relative path is for file system
  if (!root) {
    return filepath;
  }
  var dirname = filepath.replace(root, '');
  if (dirname.slice(0, 1) == path.sep) {
    dirname = dirname.slice(1);
  }
  if (dirname === '.') return '';
  return dirname;
};

exports.relativeBase = function(base) {
  // this relative base is for url
  var bits = _.filter(base.split(path.sep), function(o) { return o; });
  var dots = [];
  if (bits.length > 1) {
    _(bits.length - 1).times(function() {
      dots.push('..');
    });
    return dots.join('/');
  }
  return '.';
};

exports.match = function(regex, content, callback) {
  // extend regex match
  var match = regex.exec(content);
  while (match) {
    callback(match);
    match = regex.exec(content);
  }
};

exports.destination = function(post, format) {
  // generate the destination of a post via permalink style
  var findValue = function(key) {
    var bits = key.split('.');
    var value = post;
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
  exports.match(/\{\{(.*?)\}\}/g, format, function(match) {
    format = format.replace(match[0], findValue(match[1]));
  });
  format = format.replace(/\\\\/g, '/');
  format = format.replace(/\s+/g, '-');
  if (format.slice(0, 1) == '/') {
    return format.slice(1);
  }
  return format;
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
    var relative = exports.relativePath(item, src);
    var destination = path.join(dest, relative);
    exports.logging.debug('coping file: %s', relative);
    exports.safeWrite(destination);
    try {
      fs.writeFileSync(destination, content);
    } catch (e) {
      exports.logging.warn("can't copy %s", item);
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

function Pagination(items, page, per_page) {
  this.total_items = items;
  this.page = page;
  this.per_page = per_page;
}
Pagination.prototype.iter_pages = function(edge) {
  edge = edge || 4;
  if (this.page <= edge) {
    return _.range(1, Math.min(this.pages, 2 * edge + 1) + 1);
  }
  if (self.page + edge > this.pages) {
    return _.range(Math.max(this.pages - 2 * edge, 1), this.pages + 1);
  }
  return _.range(this.page - edge, Math.min(this.pages, this.page + edge) + 1);
};
Object.defineProperty(Pagination.prototype, 'total', {
  get: function() {
    return this.total_items.length;
  }
});
Object.defineProperty(Pagination.prototype, 'pages', {
  get: function() {
    return parseInt((this.total - 1) / this.per_page, 10) + 1;
  }
});
Object.defineProperty(Pagination.prototype, 'has_prev', {
  get: function() {
    return this.page > 1;
  }
});
Object.defineProperty(Pagination.prototype, 'prev_num', {
  get: function() {
    return this.page - 1;
  }
});
Object.defineProperty(Pagination.prototype, 'has_next', {
  get: function() {
    return this.page < this.pages;
  }
});
Object.defineProperty(Pagination.prototype, 'next_num', {
  get: function() {
    return this.page + 1;
  }
});
Object.defineProperty(Pagination.prototype, 'items', {
  get: function() {
    var start = (this.page - 1) * this.per_page;
    var end = this.page * this.per_page;
    var ret = this.total_items.slice(start, end);
    return ret;
  }
});
exports.Pagination = Pagination;
