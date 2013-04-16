require('should');
var md = require('..').sdk.markdown;

var text = [
  '# h1 1',
  '',
  'hello world',
  '',
  '````html',
  '<div>html</div>',
  '````',
  '',
  '<script>',
  'seajs.use("foo")',
  '</script>',
  '',
  '# h1 2',
  '',
  '## h2',
  '',
  '````iframe:100',
  'iframe content',
  '````',
  ''
].join('\n');

describe('markdown.render', function() {
  it('should have injected code', function() {
    md.render(text).should.include('nico-insert-code');
  });
  it('should have iframe code', function() {
    md.render(text).should.include('allowtransparency');
  });
});

describe('markdown.toc', function() {
  it('can get toc', function() {
    md.toc(text).should.have.length(3);
    md.toc(text, 1).should.have.length(2);
  });
  it('have no toc', function() {
    var code = [
      '```css',
      '#id {',
      'color: red;',
      '}',
      '```'
    ].join('\n');
    md.toc(code).should.have.length(0);
  });
});

describe('markdown.iframes', function() {
  it('can get iframes', function() {
    var iframes = md.iframes(text);
    iframes.should.have.ownProperty('iframe--1');
  });
});
