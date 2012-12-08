var reader = require('../lib/reader');
var path = require('path');
var should = require('should');
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
    toc.should.eql([]);
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
    toc.should.includeEql({id: 'title-1', text: 'title 1', level: 1});
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
  var post = new reader.Post(path.join(__dirname, 'data', 'design.md'), __dirname);

  it('should have header and body', function() {
    should.exist(post.header);
    should.exist(post.body);
  });

  it('should have toc', function() {
    should.exist(post.toc);
    post.toc.should.includeEql({id: 'the-core', text: 'The core', level: 2});
  });

  it('should have script in html', function() {
    post.html.should.include('<script>');
  });

  it('should have title', function() {
    post.title.should.equal('Design Pattern');
  });

  it('should have tags', function() {
    post.tags.should.eql(['js', 'node', 'spm']);
  });

  it('should have pubdate', function() {
    post.pubdate.format('YYYY-MM-DD').should.equal('2012-12-12');
  });

  it('should have relative path', function() {
    post.relative_filepath.should.equal(path.join('data', 'design.md'));
  });
});
