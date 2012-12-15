var _ = require('underscore');


exports.encode = function(text) {
  var html = /<(\w+).*?>(.*?)<\/\1>/;
  if (html.test(text)) {
    text = text.match(html)[2];
  }
  var regex = /[^,\.<>\/\?;\:'"\[\]\{\}\\\|`~!@#\$%\^\&\*\(\)\_\+\=\s]+/g;
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
