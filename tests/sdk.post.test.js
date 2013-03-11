require('should');
var option = require('..').sdk.option;
var post = require('..').sdk.post;

describe('file', function() {
  beforeEach(function() {
    option.set('cachedir', __dirname + '/_site/.build');
  });
  afterEach(function() {
    option.clean();
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
});
