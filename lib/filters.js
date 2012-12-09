var path = require('path');
var moment = require('moment');
var utils = require('./utils');


exports.filters = {
  xmldatetime: function(m) {
    if (moment.isMoment(m)) {
      return m.format('YYYY-MM-DDTHH:mm:ssZ');
    }
    return m;
  }
};


exports.contextfilters = {
  permalink: function(ctx) {
    var basepath = ctx.writer.filepath;
    var permalink = ctx.config.permalink;

    return function(post) {
      var url = utils.destination(post, permalink);
      if (url.slice(-11) === '/index.html') {
        return url.slice(0, -10);
      }
      return url;
    };
  }
};


exports.functions = {
};


exports.contextfunctions = {
  static_url: function(ctx) {
    var basepath = ctx.writer.filepath;

    return function(url) {
      if (url.slice(0) === '/') {
        url = url.slice(1);
      }
      ctx.config = ctx.config || {};
      var prefix = ctx.config.static_prefix || 'static';
      if (prefix.slice(-1) === '/') {
        prefix = prefix.slice(0, -1);
      }
      if (prefix.slice(0) === '/') {
        return prefix + '/' + url;
      }
      url = path.join(prefix, url);
      url = utils.relativeBase(basepath) + '/' + url;
      url = url.replace(/\\\\/g, '/');
      url = url.replace(/\\/g, '/');
      return url;
    };
  },

  content_url: function(ctx) {
    var basepath = ctx.writer.filepath;
    var permalink = ctx.config.permalink;

    return function() {
      var url = path.join.apply(null, arguments);
      url = utils.relativePath(url, basepath);

      // think about windows
      url = url.replace(/\\\\/g, '/');
      url = url.replace(/\\/g, '/');

      if (url.slice(-11) === '/index.html') {
        return url.slice(0, -10);
      }
      if (url.slice(-1) === '/') {
        return url;
      }

      // fix url with permalink
      if (permalink.slice(-5) === '.html') {
        if (url.slice(-5) === '.html') return url;
        if (url.slice(-4) === '.xml') return url;
        return url + '.html';
      }

      if (permalink.slice(-1) === '/') {
        if (url.slice(-5) === '.html') return url.slice(0, -5) + '/';
        if (url.slice(-4) === '.xml') return url.slice(0, -4) + '/';
        if (url.slice(-1) === '/') return url;
        return url + '/';
      }

      return url;
    };
  }
};
