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
  utils.storage.sourceDirectory = abspath;
  utils.storage.sourceFiles = [];
  utils.storage.sourcePublicPosts = [];
  utils.storage.sourceSecretPosts = [];
  utils.storage.sourcePages = [];

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
      utils.storage.sourceFiles.push(abspath);
    } else if (['md', 'mkd', 'markdown'].indexOf(bits[-1]) === -1) {
      utils.storage.sourceFiles.push(abspath);
    } else {
      var post = new reader.Post(filepath, abspath);
      if (!post.pubdate) {
        utils.storage.sourcePages.push(postInfo(post));
      } else if (post['public']) {
        utils.storage.sourcePublicPosts.push(postInfo(post));
      } else {
        utils.storage.sourceSecretPosts.push(postInfo(post));
      }
    }
  });
};

exports.write = function(root, writers) {
  utils.storage.outputDirectory = root;
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
