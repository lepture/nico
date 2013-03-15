var should = require('should');
var path = require('path');
var file = require('../lib/sdk/file');
var option = require('../lib/sdk/option');
var BaseWriter = require('../lib/writers/base');

describe('BaseWriter', function() {
  var writer = new BaseWriter();

  it('can load', function() {
    writer.load();
  });

  it('can process', function() {
    writer.process();
  });

  it('can render', function() {
    option.set('theme', path.join(__dirname, 'themes'));
    var destination = path.join(option.get('outputdir'), 'index.html');
    writer.render({
      destination: destination,
      params: {post: {title: 'render'}},
      template: 'page'
    });
    file.read(destination).trim().should.equal('render');
  });

  it('can use jade', function() {
    option.set('theme', path.join(__dirname, 'themes'));
    option.set('engine', 'jade');
    var destination = path.join(option.get('outputdir'), 'index.html');
    writer.render({
      destination: destination,
      params: {post: {title: 'jade'}},
      template: 'page'
    });
    option.set('engine', 'swig');
    file.read(destination).trim().should.equal('jade');
  });
});
