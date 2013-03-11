var format = require('util').format;
var hl = require('highlight.js');

var escape = function(html) {
  return html.
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;').
    replace(/"/g, '&quot;').
    replace(/'/g, '&#39;');
};
try {
  var rs = require('robotskirt');
  escape = rs.houdini.escapeHTML;
} catch (e) {
}

exports.render = function(code, language) {
  language = exports.language(language);

  if (!language) {
    return '<pre>' + escape(code) + '</pre>';
  }
  if (language === 'html') {
    language = 'xml';
  }
  code = hl.highlight(language, code).value;
  return format(
    '<div class="highlight"><pre><code class="%s">%s</code></pre></div>',
    language, code
  );
};

exports.language = function(language) {
  if (!language) {
    return null;
  }
  if (language === 'html') {
    return 'html';
  }

  var shortcuts = {
    'js': 'javascript',
    'json': 'javascript',
    'py': 'python',
    'rb': 'ruby',
    'md': 'markdown',
    'mkd': 'markdown',
    'c++': 'cpp'
  };
  if (language && shortcuts[language]) {
    language = shortcuts[language];
  }

  if (!language || !hl.LANGUAGES[language]) {
    return null;
  }

  return language;
};
