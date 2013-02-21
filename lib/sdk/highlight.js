var format = require('util').format;
var rs = require('robotskirt');
var hl = require('highlight.js');

exports.render = function(code, language) {
  language = exports.language(language);

  if (!language) {
    return '<pre>' + rs.houdini.escapeHTML(code) + '</pre>';
  }

  code = hl.highlight(language, code).value;
  return format(
    '<div class="highlight"><pre><code class="%s">%s</code></pre></div>',
    language, code
  );
}

exports.language = function(language) {
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
}
