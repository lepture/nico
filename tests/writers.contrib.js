var fs = require('fs');
var path = require('path');
var should = require('should');
var require = require('./testutils');
var Post = require('../lib/reader').Post;
var writer = require('../lib/writers/contrib');

var storage = {
  swigConfig: {
    root: [
      path.join(__dirname, 'themes', 'theme1'),
      path.join(__dirname, 'themes', 'theme2', 'templates')
    ]
  },
  config: {
    permalink: '{{filename}}.html',
    source: path.join(__dirname, 'data'),
    output: path.join(__dirname, '_site')
  },
  resource: {}
};


describe('ApiWriter', function() {
  it('should write api documentation', function() {
    var dir = path.join(__dirname, 'data');
    var post = new Post({filepath: path.join(dir, 'api-writer-post.md'), root: dir});
    var p = new writer.ApiWriter(storage);
    p.run(post);
    var text = fs.readFileSync(
      path.join(__dirname, '_site', 'api-writer-post.html'), 'utf8');
    text.should.include('id="each"');
  });
});
