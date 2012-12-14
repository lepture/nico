var require = require('./testutils').require;
var reader = require('../lib/reader');
var path = require('path');
var should = require('should');
var utils = require('../lib/utils');
utils.logging.config('error');
var meta;

describe('MarkdownParser meta', function() {
  it('should have nothing', function() {
    var parser = new reader.MarkdownParser();
    meta = parser.meta('');
    should.not.exist(meta.title);
    meta.should.eql({title: null});
  });
  it('should have title', function() {
    var parser = new reader.MarkdownParser();
    meta = parser.meta('#title');
    meta.title.should.equal('title');
    meta = parser.meta('# title ');
    meta.title.should.equal('title');
    meta = parser.meta('\n# title \ndemo');
    meta.title.should.equal('title');
  });
  it('should have description', function() {
    var parser = new reader.MarkdownParser();
    meta = parser.meta('#title\n\ndescription');
    should.exist(meta.description);
    meta.description.should.equal('<p>description</p>');
  });
  it('should have all information', function() {
    var parser = new reader.MarkdownParser();
    var html = [
      '# title',
      '',
      'description',
      '',
      '- topic: life',
      '- tags: javascript, node',
      '- link : http://lepture.com '
    ].join('\n');

    var meta = parser.meta(html);
    meta.title.should.equal('title');
    meta.description.should.equal('<p>description</p>');
    meta.topic.should.equal('life');
    meta.tags.should.equal('javascript, node');
    meta.link.should.equal('http://lepture.com');
  });
});

describe('MarkdownParser toc', function() {
  it('should have nothing', function() {
    var parser = new reader.MarkdownParser();
    var toc = parser.toc('');
    toc.should.eql('');
  });
  it('should have toc', function() {
    var parser = new reader.MarkdownParser();
    var html = [
      '# title 1',
      '',
      '## title 2',
      ''
    ].join('\n');
    var toc = parser.toc(html);
    var htmlToc = [
      '<ul><li><a href="#title-1">title 1</a>',
      '<ul><li><a href="#title-2">title 2</a></li></ul></ul>'
    ].join('');
    toc.should.equal(htmlToc);
  });
});

describe('MarkdownParser html', function() {
  it('should inject code', function() {
    var parser = new reader.MarkdownParser();
    var html = [
      '# title',
      '',
      '````js',
      'var a = "b"',
      '````',
      ''
    ].join('\n');
    var code = parser.html(html);
    code.should.include('<script>');
  });
});

describe('Post', function() {
  var post = new reader.Post({
    filepath: path.join(__dirname, 'data', 'normal-post.md'),
    root: __dirname
  });

  it('should have header and body', function() {
    should.exist(post.header);
    should.exist(post.body);
  });

  it('should have toc', function() {
    should.exist(post.toc);
  });

  it('should have title', function() {
    post.title.should.equal('Post');
  });

  it('should have tags', function() {
    post.tags.should.eql(['js', 'node']);
  });

  it('should have pubdate', function() {
    post.pubdate.format('YYYY-MM-DD').should.equal('2012-12-12');
  });

  it('can set a pubdate', function() {
    post.pubdate = '2012-12-13';
    post.pubdate.format('YYYY-MM-DD').should.equal('2012-12-13');
  });

  it('should have updated', function() {
    should.exist(post.updated._d);
  });

  it('should have status', function() {
    post.status.should.equal('secret');
    post._meta.status = 'draft';
    post.status.should.equal('draft');
  });

  it('should have directory', function() {
    post.directory.should.equal('data');
  });

  it('should have relative path', function() {
    post.relative_filepath.should.equal(path.join('data', 'normal-post.md'));
  });

  it('can render code well', function() {
    post = new reader.Post({
      filepath: path.join(__dirname, 'data', 'code.md'),
      root: __dirname
    });
    post.html.should.include('</script>');
    post.html.should.include('</style>');
    post.html.should.include('<div class="nico-insert-code">');
  });

  it('can render iframe well', function() {
    post = new reader.Post({
      filepath: path.join(__dirname, 'data', 'iframe.md'),
      root: __dirname
    });
    post.iframes.should.have.ownProperty('iframe-data-iframe-1');
    post.html.should.not.include('<div id="iframe">');
    post.html.should.include('</iframe>');
  });
});
