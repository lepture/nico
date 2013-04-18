var should = require('should');
var file = require('..').sdk.file;
var testdir = __dirname + '/_site/file-tests';

describe('file', function() {
  it('can write', function() {
    file.write(testdir + '/a/b/c.txt', 'hello');
  });
  it('can read', function() {
    file.read(testdir + '/a/b/c.txt').should.equal('hello');
  });
  it('should be root', function() {
    file.isroot('/hello').should.equal(true);
  });
  it('should not be root', function() {
    file.isroot('hello').should.equal(false);
    file.isroot('./hello').should.equal(false);
  });
  it('should copy docs to _site', function() {
    var src = __dirname +  '/../docs';
    var dest = testdir;
    file.copy(src, dest);
    var isExist = file.exists(dest + '/index.md');
    isExist.should.equal(true);
  });
  it('should be should', function() {
    file.require(should).should.equal(should);
  });
  it('should require underscore', function() {
    var _ = require('underscore');
    file.require('underscore').VERSION.should.equal(_.VERSION);
  });
  it('can list files', function() {
    var datafiles = file.list(__dirname + '/data');
    datafiles.should.include(__dirname + '/data/year/2012-1.md');
  });
  it('can read json', function() {
    var data = file.readJSON(__dirname + '/../package.json');
    data.should.have.ownProperty('name');
  });
});
