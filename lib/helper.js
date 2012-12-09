/*
 * command line helper for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 *
 * Documentation on storage:
 *
 * storage.config = {
 *   // anything in compose.json
 *   source:
 *   output:
 *   theme:
 *   permalink:
 *   writers:
 * }
 *
 * storage.resource = {
 *   files:
 *   pages:
 *   publicPosts:
 *   secretPosts:
 * }
 *
 * storage.swigConfig = {
 *   root: [],
 *   filters: [],
 *   tzOffset: 0
 *   ...
 * }
 */

var path = require('path');
var _ = require('underscore');
var reader = require('./reader');
var utils = require('./utils');


exports.callReader = function(storage) {
  // need storage.config.source
  storage.config.PostRender = storage.config.PostRender || reader.Post;

  storage.resource = storage.resource || {};
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

  var abspath = storage.config.source;
  utils.walkdir(abspath).files.forEach(function(filepath) {
    var basename = path.basename(filepath);
    var bits = basename.split('.');
    if (bits.length === 1) {
      storage.resource.files.push(abspath);
    } else if (_.indexOf(['md', 'mkd', 'markdown'], _.last(bits)) === -1) {
      storage.resource.files.push(abspath);
    } else {
      var post = new storage.config.PostRender({
        filepath: filepath,
        root: abspath
      });
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

exports.callWriters = function(storage) {
  // need storage.config.writers
  storage.config.writers.forEach(function(item) {
    var directory = path.dirname(item);
    if (directory.slice(0, 1) !== '/') {
      directory = path.join(process.cwd(), directory);
    }
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
