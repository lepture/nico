var require = require('./testutils').require;
var filters = require('../lib/filters');

describe('content_url', function() {
  var content_url = filters.contextfunctions.content_url;
  content_url = content_url({
    writer: {filepath: '2012/hello-word.html'},
    config: {permalink: '{{year}}/{{filename}}'}
  });

  it('should be ./desgin', function() {
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
