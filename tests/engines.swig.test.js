require('should');
var fs = require('fs');
var path = require('path');

var swig = require('swig');

var file = require('../lib/sdk/file');
var option = require('../lib/sdk/option');
var BaseWriter = require('../lib/writers/base');

describe('swig works', function() {
  var writer = new BaseWriter();

  var outputdir = option.get('outputdir');
  var source = option.get('source');
  var theme = option.get('theme');
  var swigTemp;
  var destination;

  before(function() {
    option.set('outputdir', 'tests/_site');
    option.set('source', 'tests/data');
    option.set('theme', path.join(__dirname, 'themes'));
    swigTemp = path.join(option.get('theme'), 'templates', 'swig.html');
    destination = path.join(option.get('outputdir'), 'index.html');
  });
  after(function() {
    option.set('outputdir', outputdir);
    option.set('source', source);
    option.set('theme', theme);

    fs.writeFileSync(swigTemp, '');
  });

  it('can load', function() {
    writer.load();
  });

  it('can process', function() {
    writer.process();
  });

  it('tags #autoescape true', function() {
    fs.writeFileSync(swigTemp, '{% autoescape true %}{{ myvar }}{% endautoescape %}');

    writer.render({
      destination: destination,
      params: { myvar: '<foo>' },
      template: 'swig'
    });
    file.read(destination).trim().should.equal('&lt;foo&gt;');
  });

  it('tags #autoescape false', function() {
    fs.writeFileSync(swigTemp, '{% autoescape true %}{{ myvar }}{% endautoescape %}');

    writer.render({
      destination: destination,
      params: { myvar: '<foo>' },
      template: 'swig'
    });
    file.read(destination).trim().should.equal('&lt;foo&gt;');
  });

  it('tags #autoescape js', function() {
    fs.writeFileSync(swigTemp, '{% autoescape "js" %}{{ myvar }}{% endautoescape %}');

    writer.render({
      destination: destination,
      params: { myvar: '<foo>' },
      template: 'swig'
    });
    file.read(destination).trim().should.equal('\\u003Cfoo\\u003E');
  });

  it('tags #autoescape html', function() {
    fs.writeFileSync(swigTemp, '{% autoescape "js" %}{{ myvar }}{% endautoescape %}');

    writer.render({
      destination: destination,
      params: { myvar: '<foo>' },
      template: 'swig'
    });
    file.read(destination).trim().should.equal('\\u003Cfoo\\u003E');
  });

  it('tags #else', function() {
    fs.writeFileSync(swigTemp, '{% if false %} statement1 {% else %} statement2 {% endif %}');

    writer.render({
      destination: destination,
      params: {},
      template: 'swig'
    });
    file.read(destination).trim().should.equal('statement2');
  });

  it('tags #elif', function() {
    fs.writeFileSync(swigTemp, '{% if false %} Tacos {% elseif true %} Burritos {% else %} Churros {% endif %}');

    writer.render({
      destination: destination,
      params: {},
      template: 'swig'
    });
    file.read(destination).trim().should.equal('Burritos');
  });

  it('tags #filter', function() {

    swig.setFilter('uppercase', function(value) {
      return value ? value.toUpperCase() : '';
    });

    fs.writeFileSync(swigTemp, '{% filter uppercase %}oh hi, {{ name }}{% endfilter %}');

    writer.render({
      destination: destination,
      params: { name: 'paul' },
      template: 'swig'
    });
    file.read(destination).trim().should.equal('OH HI, PAUL');
  });

  it('tags #for', function() {
    fs.writeFileSync(swigTemp, '{% for x in obj %}{% if loop.first %}<ul>{% endif %}<li>{{ loop.index }} - {{ loop.key }}: {{ x }}</li>{% if loop.last %}</ul>{% endif %}{% endfor %}');

    writer.render({
      destination: destination,
      params: { obj: { one: 'hi', two: 'bye' } },
      template: 'swig'
    });
    file.read(destination).trim().should.equal('<ul><li>1 - one: hi</li><li>2 - two: bye</li></ul>');
  });

  it('tags #for key', function() {
    fs.writeFileSync(swigTemp, '{% for key, val in arr|reverse %}\n{{ key }} -- {{ val }}\n{% endfor %}');

    writer.render({
      destination: destination,
      params: { arr: [1, 2, 3] },
      template: 'swig'
    });

    var html = fs.readFileSync(path.join(__dirname, '_site/index.html'));
    var result = html.toString().split('\n');
    result = result.filter(function(item) {
      return item !== '';
    });

    result.should.eql(['0 -- 3', '1 -- 2', '2 -- 1']);
  });

  it('tags #spaceless loop.index', function() {
    fs.writeFileSync(swigTemp, '{% spaceless %}\n{% for num in foo %}\n<li>{{ loop.index }}</li>\n{% endfor %}\n{% endspaceless %}');

    writer.render({
      destination: destination,
      params: { foo: [1, 2, 3] },
      template: 'swig'
    });

    file.read(destination).trim().should.equal('<li>1</li><li>2</li><li>3</li>');
  });
});
