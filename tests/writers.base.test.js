var should = require('should');
var path = require('path');
var option = require('../lib/sdk/option');
var BaseWriter = require('../lib/writers/base');

describe('BaseWriter', function() {
  var writer = new BaseWriter();

  it('can start', function() {
    writer.start();
  });

  it('can stop', function() {
    writer.stop();
  });

  it('can render', function() {
    option.set('theme', path.join(__dirname, 'themes', 'theme2'));
    var destination = option.get('outputdir');
    writer.render({
      destination: path.join(destination, 'index.html'),
      params: {},
      template: 'page.html'
    });
  });
});
