var share = require('./_share');
var md = require('./_lib');
var marked = md;

exports.markdown = marked.parse;

var hlRenderer = new md.Renderer();
hlRenderer.header = share.header;
hlRenderer.blockcode = share.blockcode;

var hlMarkdown = function(src) {
  var opt = {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true
  };
  return md.Parser.parse(md.Lexer.lex(src, opt), opt, hlRenderer);
};

exports.render = function(text) {
  return share.normalRender(text, hlMarkdown);
};


var tocRenderer = new marked.Renderer();
tocRenderer.header = share.tocHeader;

var tocMarkdown = function(src) {
  var opt = {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true
  };
  return md.Parser.parse(md.Lexer.lex(src, opt), opt, tocRenderer);
};

exports.toc = function(text, level) {
  return share.tocRender(text, level, tocMarkdown);
};


var iframeRenderer = new marked.Renderer();
iframeRenderer.blockcode = share.iframeBlockcode;
var iframeMarkdown = function(src) {
  var opt = {
    gfm: true,
    tables: false,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: false
  };
  return md.Parser.parse(md.Lexer.lex(src, opt), opt, iframeRenderer);
};
exports.iframes = function(text) {
  return share.iframeRender(text, iframeMarkdown);
};
