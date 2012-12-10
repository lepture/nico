var require = require('./testutils').require;
var utils = require('../lib/utils');
var fs = require('fs');
var path = require('path');
var should = require('should');
var underscore = require('underscore');

describe('utils encodeURIComponent', function() {
  it('should be hello-world', function() {
    utils.encodeURIComponent('Hello World').should.equal('hello-world');
    utils.encodeURIComponent('H!el?lo-Wo$%rld').should.equal('h-el-lo-wo-rld');
    utils.encodeURIComponent('`%he()llo<world>').should.equal('he-llo-world');
  });
  it('can encode unicode', function() {
    var text = '¡å hello 中文';
    utils.encodeURIComponent(text).should.equal('%C2%A1%C3%A5-hello-%E4%B8%AD%E6%96%87');
  });
});

describe('utils destination', function() {
  var post = {
    year: function() { return 2012; },
    month: function() { return 1; },
    filename: 'hello'
  };

  it('should format to 2012/01/hello', function() {
    var value = utils.destination(post, '{{year}}/{{month}}/{{filename}}');
    value.should.equal('2012/01/hello');
  });

  it('should format to blog/01/hello', function() {
    var value = utils.destination(post, 'blog/{{month}}/{{filename}}');
    value.should.equal('blog/01/hello');
  });
});

describe('utils copy', function() {
  it('should copy docs to _site', function() {
    var src = path.join(__dirname, '..', 'docs');
    var dest = path.join(__dirname, '_site');
    utils.copy(src, dest);
    var isExist = fs.existsSync(path.join(dest, 'index.md'));
    isExist.should.equal(true);
  });
});

describe('Pagination', function() {
  it('should be a pagination', function() {
    var items = underscore.range(100);
    var p = new utils.Pagination(items, 2, 30);
    p.items.should.eql(underscore.range(30, 60));
  });
});
