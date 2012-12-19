var require = require('./testutils').require;
var filters = require('../lib/filters');

describe('content_url', function() {
  var content_url;

  it('query permalink {{year}}/{{filename}}', function() {
    content_url = filters.contextfunctions.content_url({
      writer: {filepath: '2012/hello-word.html'},
      config: {permalink: '{{year}}/{{filename}}'}
    });

    content_url('index.html').should.equal('../');
    content_url('').should.equal('../');

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
    content_url('index.html').should.equal('');
    content_url('foo/index.html').should.equal('foo/');

    content_url = filters.contextfunctions.content_url({
      writer: {filepath: 'index.html'},
      config: {permalink: '{{year}}/{{filename}}/'}
    });
    content_url('index.html').should.equal('');
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
