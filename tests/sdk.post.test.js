var should = require('should');
var option = require('..').sdk.option;
var post = require('..').sdk.post;

describe('post', function() {
  beforeEach(function() {
    option.set('cachedir', __dirname + '/_site/.build');
  });
  afterEach(function() {
    option.clean();
  });

  it('can get permalink', function() {
    var ret = post.permalink({hello: 'hello'}, '{{hello}}');
    ret.should.equal('hello');
    ret = post.permalink(
      {foo: 'foo', bar: {baz: 'baz'}},
      '{{hello}}'
    );
    ret.should.equal('');

    ret = post.permalink(
      {foo: 'foo', bar: {baz: 'baz'}},
      '{{bar.baz}}/{{foo}}'
    );
    ret.should.equal('baz/foo');
  });

  it('can read', function() {
    var data = post.read(__dirname + '/data/normal-post.md');
    data.title.should.equal('Post');
    data.tags.should.have.length(2);

    // read from index
    post.index(data);
    data = post.read(__dirname + '/data/normal-post.md');
    data.title.should.equal('Post');
    data.tags.should.have.length(2);
  });

  it('has toc', function() {
    var data = post.read(__dirname + '/data/unicode-post.md');
    data.toc.should.include('<ul>');
  });

  it('can load posts', function() {
    post.load(__dirname + '/data');
  });

  var items = [];
  for (var i = 0; i < 100; i++) {
    items.push({
      filepath: 'tests/data/page.md'
    });
  }
  it('can paginate', function() {
    var p1 = post.paginate(1, items);
    p1.pages.should.eql(5);
    p1.total.should.eql(100);
    p1.perpage.should.eql(20);
    p1.has_prev.should.eql(false);
    p1.next_num.should.eql(2);
    p1.has_next.should.eql(true);

    var p2 = post.paginate(2, items);
    p2.has_prev.should.eql(true);
    p2.next_num.should.eql(3);
    p2.has_next.should.eql(true);
    p2.prev_num.should.eql(1);

    var p5 = post.paginate(5, items);
    p5.has_prev.should.eql(true);
    p5.has_next.should.eql(false);
    p5.prev_num.should.eql(4);
  });
});
