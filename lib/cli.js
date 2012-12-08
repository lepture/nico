/*
 * command line tools for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 */

var path = require('path');
var _ = require('underscore');
var reader = require('./reader');
var utils = require('./utils');


exports.callReader = function(root, storage) {
  var abspath = path.resolve(root);
  storage = storage || {};
  storage.config = {};
  storage.config.source = abspath;

  storage.resource = {};
  storage.resource.files = [];
  storage.resource.publicPosts = [];
  storage.resource.secretPosts = [];
  storage.resource.pages = [];

  var postInfo = function(post) {
    return {
      filepath: post.filepath,
      title: post.title,
      meta: post.meta,
      pubdate: post.pubdate,
      updated: post.updated,
      tags: post.tags,
      filename: post.filename,
      directory: post.directory,
      template: post.template
    };
  };

  utils.walkdir(abspath).files.forEach(function(filepath) {
    var basename = path.basename(filepath);
    var bits = basename.split('.');
    if (bits.length === 1) {
      storage.resource.files.push(abspath);
    } else if (_.indexOf(['md', 'mkd', 'markdown'], _.last(bits)) === -1) {
      storage.resource.files.push(abspath);
    } else {
      var post = new reader.Post(filepath, abspath);
      if (!post.pubdate) {
        storage.resource.pages.push(postInfo(post));
      } else if (post.status === 'secret') {
        storage.resource.secretPosts.push(postInfo(post));
      } else if (post.status !== 'draft') {
        storage.resource.publicPosts.push(postInfo(post));
      }
    }
  });
  return storage;
};

exports.callWriters = function(root, writers, storage) {
  storage = storage || {};
  storage.config = storage.config || {};
  storage.config.output = root;

  writers.forEach(function(item) {
    var directory = path.dirname(item);
    var basename = path.basename(item);
    var bits = basename.split('.');
    if (bits.length === 2) {
      var module = require(path.join(directory, _.first(bits)));
      var writer = new module[_.last(bits)](storage);
      writer.start();
      writer.end();
    }
  });
  return storage;
};

exports.config = function(conf) {
  var storage = {};
  if (_.isString(conf)) {
    storage.config = require(conf);
  } else if (_.isObject(conf)) {
    storage.config = conf;
  }
  return storage;
};
