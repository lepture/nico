require('should');
var encode = require('..').sdk.encode;

describe('encode.uri', function() {
  it('should be hello-world', function() {
    encode.uri('Hello World').should.equal('hello-world');
    encode.uri('H!el?lo-Wo$%rld').should.equal('h-el-lo-wo-rld');
    encode.uri('`%he()llo<world>').should.equal('he-llo');
  });
  it('can encode unicode', function() {
    var text = '¡å hello 中文';
    encode.uri(text).should.equal('%C2%A1%C3%A5-hello-%E4%B8%AD%E6%96%87');
  });
  it('can encode html', function() {
    var text = '<a>hello</a>';
    encode.uri(text).should.equal('hello');
    text = '<a>hello</a><b>world</b>';
    encode.uri(text).should.equal('helloworld');
  });
});


describe('encode.filepath', function() {
  it('should be hello-world', function() {
    encode.filepath('/Volumn Gallery/workspace/Hello World.md').should.equal('/Volumn Gallery/workspace/hello-world.md');
    encode.filepath('/path/H!el?lo-Wo$%rld').should.equal('/path/h-el-lo-wo-rld');
  });
  it('can encode unicode', function() {
    encode.filepath('/path/¡å hello 中文').should.equal('/path/¡å-hello-中文');
  });
});
