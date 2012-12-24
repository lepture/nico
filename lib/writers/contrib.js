/*
 * writers from outside
 *
 */


var path = require('path');
var util = require('util');
var logging = require('colorful').logging;
var BaseWriter = require('./base').BaseWriter;
var urilab = require('../utils/uri');
var utils = require('../utils');


// this writer is contributed by Hsiaoming Yang <lepture@me.com>
// it is not a common writer, you don't have to config it in your `nico.json`
// you should write your post like this:
//
// # title
//
// - writer: nico.ApiWriter
// --------
// :section Collections: Collection Functions (Arrays or Objects)
//
// :item each: `_.each(list, iterator, [context])
// iterates over a list of elements .....
//
exports.ApiWriter = BaseWriter.extend({
  writerName: 'ApiWriter',

  run: function(post) {
    var lines = post.body.split('\n');
    var body = [], sidebar = [], inSection = false, match;
    lines.forEach(function(line) {
      // find section
      var section = /^:section\s+(.*?):/;
      match = line.match(section);
      if (match && match.length == 2) {
        var title = match[1];
        sidebar.push(
          util.format(
            '<a class="toc-title" href="#%s">%s</a>',
            urilab.encode(title), title)
        );
        if (inSection) {
          inSection = false;
          sidebar.push('</ul>');
        }
        line = line.replace(section, '');
        body.push(util.format('<h2 id="%s">%s</h2>', urilab.encode(title), line));
        return;
      }
      // find item
      var item = /^:item\s+(.*?):/;
      var alias = /:alias\s+(.*?):$/;
      match = line.match(item);
      if (match && match.length === 2) {
        var keyword = match[1];
        if (!inSection) {
          inSection = true;
          sidebar.push('<ul class="toc-section">');
        }
        sidebar.push(util.format('<li>- <a href="#%s">%s</a></li>', urilab.encode(keyword), keyword));
        // parse alias
        match = line.match(alias);
        if (match && match.length === 2) {
          line = line.replace(alias, util.format('<span class="alias">Alias: <strong>%s</strong></span><br />', match[1]));
        }
        line = line.replace(item, util.format('<strong id="%s" class="header">%s</strong>', urilab.encode(keyword), keyword));
        body.push(line);
        return;
      }
      body.push(line);
    });
    post.body = body.join('\n');
    sidebar = sidebar.join('\n');
    var template = path.join(__dirname, '_templates', 'api-writer.html');
    this.render({
      destination: utils.destination(
        post, '{{directory}}/{{filename}}.html'),
      params: {post: post, sidebar: sidebar},
      template: post.template || template
    });
  }
});
