var should = require('should');
var fs = require('fs');
var path = require('path');
var file = require('../lib/sdk/file');
var option = require('../lib/sdk/option');
var ArchiveWriter = require('../lib/writers/core').ArchiveWriter;

var items = [{
  title: 'Life and Work',
  filepath: 'tests/data/post/post-1.md',
  meta: {
    pubdate: '2013-01-05T00:00:00.000Z'
  }
}, {
  title: 'Life',
  filepath: 'tests/data/post/post-2.md',
  meta: {
    pubdate: '2008-04-30T00:00:00.000Z'
  }
}, {
  title: 'Work',
  filepath: 'tests/data/post/post-3.md',
  meta: {
    pubdate: '2008-06-13T00:00:00.000Z'
  }
}];


describe('ArchiveWriter', function() {
  var outputdir = option.get('outputdir');
  var source = option.get('source');
  var theme = option.get('theme');

  beforeEach(function() {
    option.set('outputdir', 'tests/_site');
    option.set('source', 'tests/data');
    option.set('theme', path.join(__dirname, 'themes'));
  });
  afterEach(function() {
    option.set('outputdir', outputdir);
    option.set('source', source);
    option.set('theme', theme);
  });

  it('can render sorted posts', function() {
    var writer = new ArchiveWriter();
    writer._create('archive', 'index.html', items);
    var html = fs.readFileSync(path.join(__dirname, '_site/index.html'));
    var result = html.toString().split('\n');
    result.shift();
    result.should.eql(['Life and Work', 'Work', 'Life']);
  });
});
