var require = require('./testutils').require;
var helper = require('../lib/helper');
var utils = require('../lib/utils');
var path = require('path');

var helperConfig = {
  swigConfig: {
    root: [path.join(__dirname, 'themes', 'theme1'), path.join(__dirname, 'themes', 'theme2')]
  },
  config: {
    permalink: 'helper/{{filename}}.html',
    output: path.join(__dirname, '_site')
  },
  resource: {}
};


describe('callReader', function() {
  it('should have 1 public post, 1 secret post and 1 page', function() {
    var storage = helper.callReader({
      config: {
        source: path.join(__dirname, 'data')
      }
    });
    var resource = storage.resource;
    resource.publicPosts.length.should.equal(1);
    resource.secretPosts.length.should.equal(1);
    resource.pages.length.should.equal(1);
  });
});

describe('config', function() {
  it('should config well', function() {
    helper.config(helperConfig);
  });
});
