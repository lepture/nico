/*
 * command line tools for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 */

var path = require('path');
var reader = require('./reader');
var utils = require('./utils');


exports.read = function(root) {
  var abspath = path.resolve(root);
  utils.storage.config.source = abspath;
  utils.storage.resource.files = [];
  utils.storage.resource.publicPosts = [];
  utils.storage.resource.secretPosts = [];
  utils.storage.resource.pages = [];

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
    if (!bits.length) {
      utils.storage.resource.files.push(abspath);
    } else if (['md', 'mkd', 'markdown'].indexOf(bits[-1]) === -1) {
      utils.storage.resource.files.push(abspath);
    } else {
      var post = new reader.Post(filepath, abspath);
      if (!post.pubdate) {
        utils.storage.resource.pages.push(postInfo(post));
      } else if (post.status === 'secret') {
        utils.storage.resource.secretPosts.push(postInfo(post));
      } else if (post.status !== 'draft') {
        utils.storage.resource.publicPosts.push(postInfo(post));
      }
    }
  });
};

exports.write = function(root, writers) {
  utils.storage.config.output = root;
  var writerModules = [];
  writers.forEach(function(item) {
    var directory = path.dirname(item);
    var basename = path.basename(item);
    var bits = basename.split('.');
    var module = require(path.join(directory, bits[0]));
    var writer = new module[bits[1]](utils.storage);
    writerModules.push(writer);
  });
  writerModules.forEach(function(item) {
    item.start();
  });
  writerModules.forEach(function(item) {
    item.end();
  });
};

exports.config = function(conf) {
  utils.storage.config = require(conf);
};
