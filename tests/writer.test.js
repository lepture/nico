var require = require('./testutils').require;
var fs = require('fs');
var path = require('path');
var should = require('should');
var swig = require('swig');
var utils = require('../lib/utils');
utils.logging.config('error');
var reader = require('../lib/reader');
var writer = require('../lib/writer');

var storage = {
  swigConfig: {
    root: [
      path.join(__dirname, 'themes', 'theme1'),
      path.join(__dirname, 'themes', 'theme2', 'templates')
    ]
  },
  config: {
    PostRender: reader.Post,
    permalink: '{{filename}}.html',
    source: path.join(__dirname, 'data'),
    output: path.join(__dirname, '_site')
  },
  resource: {}
};

describe('PostWriter', function() {
  it('should write post design', function() {
    storage.resource.publicPosts = [];
    storage.resource.publicPosts.push({
      filepath: path.join(__dirname, 'data', 'design.md')
    });
    var p = new writer.PostWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(path.join(__dirname, '_site', 'design.html'), 'utf8');
    text.should.equal('Design Pattern');
  });

  it('can render unicode post', function() {
    storage.resource.publicPosts = [];
    storage.resource.publicPosts.push({
      filepath: path.join(__dirname, 'data', 'china-dream.md')
    });
    var p = new writer.PostWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(path.join(__dirname, '_site', 'china-dream.html'), 'utf8');
    text.should.equal('龍應台：我們的「中國夢」（8月1日北京大學演講講辭）');
  });

  it('can create iframes', function() {
    storage.resource.publicPosts = [];
    storage.resource.publicPosts.push({
      filepath: path.join(__dirname, 'data', 'fenced-code.md')
    });
    var p = new writer.PostWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(path.join(__dirname, '_site', 'fenced-code.html'), 'utf8');
    text.should.equal('Fenced Code');

    text = fs.readFileSync(
      path.join(__dirname, '_site', 'iframe-fenced-code-1.html'),
      'utf8'
    );
    text.should.include('id="iframe"');
  });

  it('can reset permalink', function() {
    storage.config.permalink = '{{filename}}';
    storage.resource.publicPosts = [];
    storage.resource.publicPosts.push({
      filepath: path.join(__dirname, 'data', 'design.md')
    });
    var p = new writer.PostWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(path.join(__dirname, '_site', 'design.html'), 'utf8');
    text.should.equal('Design Pattern');

    storage.config.permalink = '{{filename}}/';
    p = new writer.PostWriter(storage);
    p.start();
    p.end();
    text = fs.readFileSync(
      path.join(__dirname, '_site', 'design/index.html'), 'utf8'
    );
    text.should.equal('Design Pattern');
    // reset back
    storage.config.permalink = '{{filename}}.html';
  });
});


describe('PageWriter', function() {
  it('should render page well', function() {
    storage.resource.pages = [];
    storage.resource.pages.push({
      filepath: path.join(__dirname, 'data', 'page.md')
    });
    var p = new writer.PageWriter(storage);
    p.start();
    p.end();
    var text = fs.readFileSync(
      path.join(__dirname, '_site', 'page.html'), 'utf8'
    );
    text.should.equal('Page');
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
