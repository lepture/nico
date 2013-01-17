var fs = require('fs');
var path = require('path');
var should = require('should');
var swig = require('jinja');
var _ = require('underscore');
var require = require('./testutils');
var Post = require('../lib/reader').Post;
var writer = require('../lib/writers/core');

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

describe('PostWriter', function() {
  it('should write a post', function() {
    var dir = path.join(__dirname, 'data');
    storage.resource.publicPosts = [
      new Post({filepath: path.join(dir, 'normal-post.md'), root: dir})
    ];
    var p = new writer.PostWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(
      path.join(__dirname, '_site', 'normal-post.html'), 'utf8');
    text.should.equal('Post');
  });

  it('can render unicode post', function() {
    var dir = path.join(__dirname, 'data');
    storage.resource.publicPosts = [
      new Post({filepath: path.join(dir, 'unicode-post.md'), root: dir})
    ];
    var p = new writer.PostWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(
      path.join(__dirname, '_site', 'unicode-post.html'), 'utf8');
    text.should.equal('文章');
  });

  it('can create iframes', function() {
    var dir = path.join(__dirname, 'data');
    storage.resource.publicPosts = [
      new Post({filepath: path.join(dir, 'iframe.md'), root: dir})
    ];
    var p = new writer.PostWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(
      path.join(__dirname, '_site', 'iframe.html'), 'utf8');
    text.should.equal('Iframe');

    text = fs.readFileSync(
      path.join(__dirname, '_site', 'iframe-iframe-1.html'),
      'utf8'
    );
    text.should.include('id="iframe"');
  });

  it('can reset permalink', function() {
    storage.config.permalink = '{{filename}}';
    var dir = path.join(__dirname, 'data');
    storage.resource.publicPosts = [
      new Post({filepath: path.join(dir, 'normal-post.md'), root: dir})
    ];
    var p = new writer.PostWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(
      path.join(__dirname, '_site', 'normal-post.html'), 'utf8');
    text.should.equal('Post');

    storage.config.permalink = '{{filename}}/';
    p = new writer.PostWriter(storage);
    p.start();
    p.end();
    text = fs.readFileSync(
      path.join(__dirname, '_site', 'normal-post/index.html'), 'utf8'
    );
    text.should.equal('Post');
    // reset back
    storage.config.permalink = '{{filename}}.html';
  });
});


describe('PageWriter', function() {
  it('should render page well', function() {
    var dir = path.join(__dirname, 'data');
    storage.resource.pages = [
      new Post({filepath: path.join(dir, 'page.md'), root: dir})
    ];
    var p = new writer.PageWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(
      path.join(__dirname, '_site', 'page.html'), 'utf8'
    );
    text.should.equal('Page');
  });
});


describe('YearWriter', function() {
  it('can render sorted year posts', function() {
    var dir = path.join(__dirname, 'data', 'year');
    storage.resource.publicPosts = [
      new Post({filepath: path.join(dir, '2011-1.md')}),
      new Post({filepath: path.join(dir, '2011-2.md')}),
      new Post({filepath: path.join(dir, '2011-3.md')}),
      new Post({filepath: path.join(dir, '2012-1.md')})
    ];
    var p = new writer.YearWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(
      path.join(__dirname, '_site', '2011', 'index.html'), 'utf-8'
    );
    var years = _.filter(text.split('\n'), function(o) { return o; });
    years.should.eql(['2011 1', '2011 3', '2011 2']);
  });
});


describe('TagWriter', function() {
  it('can render sorted tagged posts', function() {
    var dir = path.join(__dirname, 'data', 'tag');
    storage.resource.publicPosts = [
      new Post({filepath: path.join(dir, 'post-1.md')}),
      new Post({filepath: path.join(dir, 'post-2.md')}),
      new Post({filepath: path.join(dir, 'post-3.md')})
    ];
    var p = new writer.TagWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(
      path.join(__dirname, '_site', 'tag', 'life', 'index.html'), 'utf-8'
    );
    var tags = _.filter(text.split('\n'), function(o) { return o; });
    tags.should.eql(['Life', 'Life and Work']);
  });
});


describe('StaticWriter', function() {
  it('should copy static files', function() {
    storage.config.theme = path.join(__dirname, 'themes', 'theme2');
    var p = new writer.StaticWriter(storage);
    p.start();
    p.end();
    fs.existsSync(
      path.join(__dirname, '_site', 'static', 'a.css')
    ).should.equal(true);
  });
});


describe('FileWriter', function() {
  it('should copy static files', function() {
    var p = new writer.FileWriter(storage);
    p.start();
    p.end();
    fs.existsSync(
      path.join(__dirname, '_site', 'file.txt')
    ).should.equal(true);
  });
});
