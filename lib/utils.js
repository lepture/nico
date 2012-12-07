var fs = require('fs')
var path = require('path')
var os = require('os')
var child_process = require('child_process')
var colorful = require('colorful')

exports.logging = new colorful.Logging()

exports.safeWrite = function(filepath) {
  var root;
  var dirs = path.dirname(filepath).split(path.sep)
  var mkdir = function(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  }
  for(var i = 0; i < dirs.length; i++) {
    if (root) {
      root = path.join(root, dirs[i])
    } else {
      root = dirs[i]
    }
    mkdir(root)
  }
}

exports.spawn = function(command, args, options) {
  if (os.type() === 'Windows_NT') {
    spawn = function(command, args, options) {
      args = ['/c', command].concat(args)
      command = 'cmd'
    }
  }
  return child_process.spawn(command, args, options)
}

exports.relativePath = function(filepath, root) {
  if (!root) return filepath;
  return filepath.replace(root, '').replace(path.sep, '')
}

exports.match = function(regex, content, callback) {
  var match = regex.exec(content)
  while (match) {
    callback(match)
    match = regex.exec(content)
  }
}

exports.destination = function(post, format) {
  var findValue = function(key) {
    var bits = key.split('.')
    var value = post
    for (var i = 0; i < bits.length; i++) {
      value = value[bits[i]]
      if (!value) return '';
    }
    if (!value) return '';
    if (typeof value === 'function') value = value();
    if (typeof value === 'number' && value < 10) {
      return '0' + value
    }
    return value
  }
  exports.match(/\{\{(.*?)\}\}/g, format, function(match) {
    format = format.replace(match[0], findValue(match[1]))
  })
  format = format.replace(/\/\//g, '/').replace(/\s+/g, '-')
  return format
}

exports.walkdir = function(root) {
  var walker = new Walker(root, ['.git', '.hg', '.svn'])
  walker.scan()
  return walker
}

function Walker(root, ignore) {
  this.root = root
  this.ignore = ignore || []
  this.dirs = []
  this.files = []
}

Walker.prototype.scan = function(root) {
  if (!root) root = this.root;
  var indirs = fs.readdirSync(root)
  var self = this
  indirs.forEach(function(item) {
    var abspath = path.join(root, item)
    var stat = fs.statSync(abspath)
    if (stat.isDirectory()) {
      if (self.ignore.indexOf(item) == -1) {
        self.dirs.push(abspath)
        self.scan(abspath)
      }
    } else if (stat.isFile()) {
      self.files.push(abspath)
    }
  })
}

exports.storage = {}
