var path = require('path');

exports.uri = function(text) {
  text = text.replace(/<\/?[^>]*>/g, '');
  var regex = /[^,\.<>\/\?;\:'"\[\]\{\}\\\|`~!@#\$%\^\&\*\(\)\_\+\=\s]+/g;
  var bits = text.match(regex);
  if (bits) {
    text = bits.join('-').toLowerCase();
  }
  text = text.replace(/-{2,}/g, '-');
  return text;
};


exports.filepath = function(fpath) {
  var dirname = path.dirname(fpath);
  var text = path.basename(fpath);

  text = text.replace(/<\/?[^>]*>/g, '');
  var regex = /[^,<>\/\?;\:'"\[\]\{\}\\\|`~!@#\$%\^\&\*\(\)\_\+\=\s]+/g;
  text = text.match(regex).join('-').toLowerCase();
  text = text.replace(/-{2,}/g, '-');
  return path.join(dirname, text);
};
