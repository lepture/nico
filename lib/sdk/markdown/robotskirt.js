var share = require('./_share');
var rs = require('robotskirt');

var parser = new rs.Markdown(new rs.HtmlRenderer());
exports.markdown = function(content) {
  return parser.render(content);
};

var hlRenderer = new rs.HtmlRenderer([rs.HTML_USE_XHTML]);
hlRenderer.header = share.header;
hlRenderer.blockcode = share.blockcode;

var hlMarkdown = new rs.Markdown(
  hlRenderer,
  [
    rs.EXT_FENCED_CODE, rs.EXT_TABLES,
    rs.EXT_AUTOLINK, rs.EXT_NO_INTRA_EMPHASIS,
    rs.EXT_STRIKETHROUGH
  ]
);

exports.render = function(text) {
  return share.normalRender(text, hlMarkdown);
};


var tocRenderer = new rs.HtmlRenderer();
tocRenderer.header = share.tocHeader;
var tocMarkdown = new rs.Markdown(
  tocRenderer,
  [rs.EXT_FENCED_CODE, rs.EXT_TABLES]
);

exports.toc = function(text, level) {
  return share.tocRender(text, level, tocMarkdown);
};

var iframeRenderer = new rs.HtmlRenderer();
iframeRenderer.blockcode = share.iframeBlockcode;
var iframeMarkdown = new rs.Markdown(
  iframeRenderer, [rs.EXT_FENCED_CODE]
);
exports.iframes = function(text) {
  return share.iframeRender(text, iframeMarkdown);
};
