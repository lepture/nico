require('should');
var option = require('..').sdk.option;

describe('option', function() {
  it('can get default values', function() {
    option.get('cachedir').should.equal('.cache');
  });
  it('can set values', function() {
    option.set('cachedir', 'cache');
    option.get('cachedir').should.equal('cache');
    option.clean();
    option.get('cachedir').should.equal('.cache');

    option.option('cachedir').should.equal('.cache');
    option.option('cachedir', 'cache');
    option.get('cachedir').should.equal('cache');
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
