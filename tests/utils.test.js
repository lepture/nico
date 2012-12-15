var fs = require('fs');
var path = require('path');
var should = require('should');
var underscore = require('underscore');
var require = require('./testutils').require;
var utils = require('../lib/utils');
var urilab = require('../lib/utils/uri');
var pathlib = require('../lib/utils/path');
var Pagination = require('../lib/utils/extra').Pagination;


describe('uri encode', function() {
  it('should be hello-world', function() {
    urilab.encode('Hello World').should.equal('hello-world');
    urilab.encode('H!el?lo-Wo$%rld').should.equal('h-el-lo-wo-rld');
    urilab.encode('`%he()llo<world>').should.equal('he-llo-world');
  });
  it('can encode unicode', function() {
    var text = '¡å hello 中文';
    urilab.encode(text).should.equal('%C2%A1%C3%A5-hello-%E4%B8%AD%E6%96%87');
  });
  it('can encode html', function() {
    var text = '<a>hello</a>';
    urilab.encode(text).should.equal('hello');
    text = '<a>hello</a><b>world</b>';
    urilab.encode(text).should.equal('helloworld');
  });
});

describe('pathlib', function() {
  it('should be root', function() {
    pathlib.isroot('/hello').should.equal(true);
  });
  it('should not be root', function() {
    pathlib.isroot('hello').should.equal(false);
    pathlib.isroot('./hello').should.equal(false);
  });
  it('should copy docs to _site', function() {
    var src = path.join(__dirname, '..', 'docs');
    var dest = path.join(__dirname, '_site');
    pathlib.copy(src, dest);
    var isExist = fs.existsSync(path.join(dest, 'index.md'));
    isExist.should.equal(true);
  });
});

describe('utils require', function() {
  it('should be should', function() {
    utils.require(should).should.equal(should);
  });
  it('should require underscore', function() {
    utils.require('underscore').VERSION.should.equal(underscore.VERSION);
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


describe('Pagination', function() {
  it('should be a pagination', function() {
    var items = underscore.range(100);
    var p = new Pagination(items, 2, 30);
    p.items.should.eql(underscore.range(30, 60));
    p.total.should.equal(100);
    p.has_prev.should.equal(true);
    p.prev_num.should.equal(1);
    p.has_next.should.equal(true);
    p.next_num.should.equal(3);
    p.pages.should.equal(4);
  });
});
