var require = require('./testutils').require;
var cli = require('../lib/cli');
var utils = require('../lib/utils');
var path = require('path');

var cliConfig = {
  swigConfig: {
    root: [path.join(__dirname, 'themes', 'theme1'), path.join(__dirname, 'themes', 'theme2')]
  },
  config: {
    permalink: 'cli/{{filename}}.html',
    output: path.join(__dirname, '_site')
  },
  resource: {}
};


describe('callReader', function() {
  it('should have public posts, secret posts and pages', function() {
    var storage = cli.callReader({
      config: {
        source: path.join(__dirname, 'data')
      }
    });
    var resource = storage.resource;
    resource.publicPosts.length.should.not.equal(0);
    resource.secretPosts.length.should.not.equal(0);
    resource.pages.length.should.not.equal(0);
  });
});

describe('config', function() {
  it('should config well', function() {
    cli.parseConfig(cliConfig);
  });
});
