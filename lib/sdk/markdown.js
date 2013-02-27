var format = require('util').format;
var rs = require('robotskirt');
var encode = require('./encode');
var hl = require('./highlight');


var iframeCount = 0;
var hlRenderer = new rs.HtmlRenderer([rs.HTML_USE_XHTML]);

hlRenderer.header = function(text, level) {
  var id = encode.uri(text);
  return format('<h%d id="%s">%s</h%d>', level, id, text, level);
};

hlRenderer.blockcode = function(code, language) {
  if (!language || language === '+' || language === '-') {
    return hl.render(code);
  }
  var lastChar = language.slice(-1);
  var hide = lastChar === '-';
  var inject = ~['-', '+'].indexOf(lastChar);

  if (inject) {
    language = language.slice(0, -1);
  }

  inject = inject && ~['javascript', 'css', 'xml'].indexOf(hl.language(language));

  var html = '';

  // iframe hack
  if (language.slice(0, 6) === 'iframe') {
    language = 'html';
    iframeCount++;

    var height = language.split(':')[1];
    if (height) {
      height = format('height="%s"', height);
    } else {
      height = '';
    }
    html = [
      '<div class="nico-iframe">',
      '<iframe src="iframe-%d.html" allowtransparency="true" ',
      'frameborder="0", scrolling="0" %s></iframe></div>'
    ].join('\n');
    html = format(html, iframeCount, height);
    language = 'html';
  }

  if (inject) {
    html = {
      'javascript': format('<script>%s</script>', code),
      'css': format('<style type="text/css">%s</style>', code),
      'html': format('<div class="nico-insert-code">%s</div>', code)
    }[language]
  }

  if (hide && inject) {
    return html;
  }

  return html + hl.render(code, language);
};

var hlMarkdown = new rs.Markdown(
  hlRenderer,
  [
    rs.EXT_FENCED_CODE, rs.EXT_TABLES,
    rs.EXT_AUTOLINK, rs.EXT_NO_INTRA_EMPHASIS,
    rs.EXT_STRIKETHROUGH
  ]
);


exports.render = function(text) {
  iframeCount = 0;
  text = text.replace(/^````(\w+)/gm, '````$1+');
  text = text.replace(/^`````(\w+)/gm, '`````$1-');
  return hlMarkdown.render(text);
};


// get toc
var toc = [];
var tocRenderer = new rs.HtmlRenderer();
tocRenderer.header = function(text, level) {
  var id = encode.uri(text);
  toc.push({id: id, text: text, level: level});
  return format('<h%d id="%s">%s</h%d>', level, id, text, level);
}
var tocMarkdown = new rs.Markdown(tocRenderer);

exports.toc = function(text) {
  toc = [];
  tocMarkdown.render(text);
  return toc;
};

// get iframes
var iframes = {};
var iframeRenderer = new rs.HtmlRenderer();
iframeRenderer.blockcode = function(code, language) {
  if (!language) return '';
  if (language.slice(0, 6) === 'iframe') {
    iframeCount++;
    iframes['iframe-' + iframeCount] = code;
  }
};
var iframeMarkdown = new rs.Markdown(iframeRenderer, [rs.EXT_FENCED_CODE]);
exports.iframes = function(text) {
  iframes = {};
  iframeCount = 0;
  iframeMarkdown.render(text);
  return iframes;
};
