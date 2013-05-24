require('should');
var option = require('..').sdk.option;

describe('option', function() {
  it('can get default values', function() {
    option.get('encoding').should.equal('utf8');
  });
  it('can set values', function() {
    option.set('encoding', 'unicode');
    option.get('encoding').should.equal('unicode');
    option.clean();
    option.get('encoding').should.equal('utf8');

    option.option('encoding').should.equal('utf8');
    option.option('encoding', 'unicode');
    option.get('encoding').should.equal('unicode');
    option.clean();
  });
  it('will init with some values', function() {
    var o = new option.Option({foo: 'bar'});
    o.get('foo').should.equal('bar');
  });
  it('can clean a key', function() {
    var o = new option.Option({foo: 'bar'});
    o.clean('foo');
    o._cache.should.eql({});
  });
  it('can set defaults', function() {
    option.defaults({
      foo: {
        foo: 'bar'
      }
    });
    option.set('foo', {bar: 'foo'});
    option.get('foo').should.have.ownProperty('foo');
    option.get('foo').should.have.ownProperty('bar');
  });
});
