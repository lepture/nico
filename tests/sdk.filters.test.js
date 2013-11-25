var should = require('should');
var filters = require('..').sdk.filters;

describe('filters', function() {
  it('can render markdown', function() {
    var markdown = filters.filters.markdown;
    markdown('# header').should.include('header</h1>');
  });
  it('can render xmldatetime', function() {
    var xmldatetime = filters.filters.xmldatetime;
    xmldatetime('2012-12-25').should.include('2012-12-25T00:00:00');

    var d = new Date();
    xmldatetime(d).should.equal(d.toISOString());
  });
  it('can sort objects', function() {
    var items = {
      'a': {
        key: 1
      },
      'c': {
        key: 3
      },
      'b': {
        key: 2
      }
    };
    var sortby = filters.filters.sortby;
    var ret = sortby(items, 'key');
    ret.should.eql([{key: 1}, {key: 2}, {key: 3}]);

    ret = sortby(items, '-key');
    ret.should.eql([{key: 3}, {key: 2}, {key: 1}]);
  });
});

describe('content_url', function() {
  var content_url;

  it('query permalink {{year}}/{{filename}}', function() {
    content_url = filters.contextfunctions.content_url({
      writer: {filepath: '2012/hello-word.html'},
      config: {permalink: '{{year}}/{{filename}}'}
    });

    content_url('index.html').should.equal('../');
    content_url('').should.equal('..');

    content_url('./hello.html').should.equal('../hello');
    content_url('./hello').should.equal('../hello');
    content_url('hello').should.equal('../hello');
    content_url('hello.html').should.equal('../hello');
  });

  it('query permalink {{year}}/{{filename}}.html', function() {
    content_url = filters.contextfunctions.content_url({
      writer: {filepath: '2012/hello-word.html'},
      config: {permalink: '{{year}}/{{filename}}.html'}
    });

    content_url('./hello.html').should.equal('../hello.html');
    content_url('./hello').should.equal('../hello.html');
    content_url('hello').should.equal('../hello.html');
    content_url('hello.html').should.equal('../hello.html');
    content_url('').should.equal('../');
  });

  it('query permalink {{year}}/{{filename}}/', function() {
    content_url = filters.contextfunctions.content_url({
      writer: {filepath: '2012/hello-word.html'},
      config: {permalink: '{{year}}/{{filename}}/'}
    });

    content_url('./hello.html').should.equal('../hello/');
    content_url('./hello').should.equal('../hello/');
    content_url('hello').should.equal('../hello/');
    content_url('hello.html').should.equal('../hello/');
  });

  it('create index.html url', function() {
    content_url = filters.contextfunctions.content_url({
      writer: {filepath: 'index.html'},
      config: {permalink: '{{year}}/{{filename}}.html'}
    });
    content_url('index.html').should.equal('./');
    content_url('foo/index.html').should.equal('foo/');

    content_url = filters.contextfunctions.content_url({
      writer: {filepath: 'index.html'},
      config: {permalink: '{{year}}/{{filename}}/'}
    });
    content_url('index.html').should.equal('./');
    content_url('foo/index.html').should.equal('foo/');
  });
});


describe('static_url', function() {
  var static_url = filters.contextfunctions.static_url({
    writer: {filepath: '2012/hello-word.html'}
  });

  it('should be ../static/css/a.css', function() {
    static_url('css/a.css').should.equal('../static/css/a.css');
  });
});

describe('pagination_url', function() {
  it('should be ./page/1.html', function() {
    var func = filters.contextfunctions.pagination_url({
      writer: {filepath: '2012/index.html'},
      config: {permalink: '{{year}}/{{filename}}.html'}
    });
    func(1).should.equal('./page/1.html');
  });
  it('should be ./1', function() {
    var func = filters.contextfunctions.pagination_url({
      writer: {filepath: '2012/page/2.html'},
      config: {permalink: '{{year}}/{{filename}}'}
    });
    func(1).should.equal('./1');

    func = filters.contextfunctions.pagination_url({
      writer: {filepath: 'page/2.html'},
      config: {permalink: '{{year}}/{{filename}}'}
    });
    func(1).should.equal('./1');
  });
});

describe('highlight', function() {
  it('can highlight code', function() {
    var code = 'var foo = "bar";';
    var func = filters.filters.highlight;
    func(code, 'js').should.include('highlight');
  });
});
