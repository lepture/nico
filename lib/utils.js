var fs = require('fs');
var path = require('path');
var os = require('os');
var child_process = require('child_process');
var colorful = require('colorful');
var underscore = require('underscore');

exports.logging = new colorful.Logging();

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


exports.spawn = function(command, args, options) {
  if (os.type() === 'Windows_NT') {
    spawn = function(command, args, options) {
      args = ['/c', command].concat(args);
      command = 'cmd';
    };
  }
  return child_process.spawn(command, args, options);
};

exports.relativePath = function(filepath, root) {
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

exports.match = function(regex, content, callback) {
  var match = regex.exec(content);
  while (match) {
    callback(match);
    match = regex.exec(content);
  }
};

exports.destination = function(post, format) {
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

exports.walkdir = function(root) {
  var walker = new Walker(root, ['.git', '.hg', '.svn']);
  walker.scan();
  return walker;
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
    var abspath = path.join(root, item);
    var stat = fs.statSync(abspath);
    if (stat.isDirectory()) {
      if (self.ignore.indexOf(item) == -1) {
        self.dirs.push(abspath);
        self.scan(abspath);
      }
    } else if (stat.isFile()) {
      self.files.push(abspath);
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
    return underscore.range(1, Math.min(this.pages, 2 * edge + 1) + 1);
  }
  if (self.page + edge > this.pages) {
    return underscore.range(Math.max(this.pages - 2 * edge, 1), this.pages + 1);
  }
  return underscore.range(this.page - edge, Math.min(this.pages, this.page + edge) + 1);
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
