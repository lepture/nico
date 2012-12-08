var fs = require('fs');
var path = require('path');
var should = require('should');
var reader = require('../lib/reader');
var writer = require('../lib/writer');

var storage = {
  swigConfig: {
    root: [path.join(__dirname, 'themes', 'theme1'), path.join(__dirname, 'themes', 'theme2')]
  },
  config: {
    permalink: '{{filename}}.html',
    output: path.join(__dirname, '_site')
  }
};

describe('PostWriter', function() {
  it('should write post design', function() {
    var post = new reader.Post(
      path.join(__dirname, 'data', 'design.md'), __dirname
    );
    storage.sourcePublicPosts = [post];
    var p = new writer.PostWriter(storage);
    console.log();
    p.start();
    p.end();
    var text = fs.readFileSync(path.join(__dirname, '_site', 'design.html'), 'utf8');
    text.should.equal('Design Pattern');
  });
});

