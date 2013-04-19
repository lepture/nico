var format = require('util').format;
var option = require('../option');
var encode = require('../encode');
var hl = require('../highlight');


var iframeCount = 0;
exports.header = function(text, level) {
  var id = encode.uri(text);
  return format('<h%d id="%s">%s</h%d>', level, id, text, level);
};

exports.blockcode = function(code, language) {
  if (!language || language === '+' || language === '-') {
    return hl.render(code);
  }
  var lastChar = language.slice(-1);
  var hide = lastChar === '-';
  var inject = (lastChar === '-' || lastChar === '+');

  if (inject) {
    language = language.slice(0, -1);
  }

  if (language.slice(0, 6) !== 'iframe') {
    language = hl.language(language);
  }
  if (['javascript', 'css', 'html'].indexOf(language) !== -1) {
    inject = inject && true;
  }

  var html = '';
  // iframe hack
  if (language.slice(0, 6) === 'iframe') {
    iframeCount++;

    var height = language.split(':')[1];
    if (height) {
      height = format('height="%s"', height);
    } else {
      height = '';
    }
    html = [
      '<div class="nico-iframe">',
      '<iframe src="iframe-%s-%d.html" allowtransparency="true" ',
      'frameborder="0" scrolling="0" %s></iframe></div>'
    ].join('\n');
    var iframeId = option.get('iframeId') || '';
    html = format(html, iframeId, iframeCount, height);
    language = 'html';
  } else if (inject) {
    html = {
      'javascript': format('<script>%s</script>', code),
      'css': format('<style type="text/css">%s</style>', code),
      'html': format('<div class="nico-insert-code">%s</div>', code)
    }[language];
  }

  if (hide && inject) {
    return html;
  }

  return html + hl.render(code, language);
};

exports.normalRender = function(text, fn) {
  iframeCount = 0;
  text = text.replace(/^````([\w\:]+)$/gm, '````$1+');
  text = text.replace(/^`````([\w\:]+)$/gm, '`````$1-');
  if (fn.render) return fn.render(text);
  return fn(text);
};


// get toc
var toc = [];
var tocLevel = 3;
exports.tocHeader = function(text, level) {
  var id = encode.uri(text);
  if (level <= tocLevel) {
    toc.push({id: id, text: text, level: level});
  }
  return format('<h%d id="%s">%s</h%d>', level, id, text, level);
};
exports.tocRender = function(text, level, fn) {
  toc = [];
  tocLevel = level || 3;
  if (fn.render) {
    fn.render(text);
  } else {
    fn(text);
  }
  return toc;
};


// get iframes
var iframes = {};
exports.iframeBlockcode = function(code, language) {
  if (!language) return '';
  if (language.slice(0, 6) === 'iframe') {
    iframeCount++;
    var iframeId = option.get('iframeId') || '';
    iframes[format('iframe-%s-%d', iframeId, iframeCount)] = code;
  }
};
exports.iframeRender = function(text, fn) {
  iframes = {};
  iframeCount = 0;
  if (fn.render) {
    fn.render(text);
  } else {
    fn(text);
  }
  return iframes;
};
