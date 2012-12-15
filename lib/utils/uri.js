var _ = require('underscore');
var match = require('./extra').match;


exports.encode = function(text) {
  var regex = /<(\w+).*?>(.*?)<\/\1>/g;
  var cleanText = '';
  match(regex, text, function(m) {
    cleanText += m[2];
  });
  if (cleanText) text = cleanText;
  regex = /[^,\.<>\/\?;\:'"\[\]\{\}\\\|`~!@#\$%\^\&\*\(\)\_\+\=\s]+/g;
  text = text.match(regex).join('-').toLowerCase();
  return encodeURIComponent(text);
};


exports.relative = function(base, uri) {
  base = base.replace(/\\/g, '/');
  var bits = _.filter(base.split('/'), function(o) { return o; });
  var dots = [];
  if (bits.length > 1) {
    _(bits.length - 1).times(function() {
      dots.push('..');
    });
    uri = dots.join('/') + '/' + uri;
  } else {
    uri = './' + uri;
  }
  return uri.replace(/\\/g, '/');
};
