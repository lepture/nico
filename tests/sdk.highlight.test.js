var path = require('path');
var should = require('should');
var hl = require('..').sdk.highlight;

describe('highlight.language', function() {
  it('should be the same name', function() {
    hl.language('python').should.equal('python');
  });

  it('should transport short name to full name', function() {
    hl.language('py').should.equal('python');
    hl.language('c++').should.equal('cpp');
  });

  it('should be nothing', function() {
    should.not.exist(hl.language('some-language'));
  });
});

describe('highlight.render', function() {
  it('should render no highlight code', function() {
    hl.render('a', 'abc').should.equal('<pre>a</pre>');
  });

  it('should render highlight code', function() {
    hl.render('var a', 'js').should.include('highlight');
  });
});
