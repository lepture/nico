
exports.uri = function(text) {
  text = text.replace(/<\/?[^>]*>/g, '');
  var regex = /[^,\.<>\/\?;\:'"\[\]\{\}\\\|`~!@#\$%\^\&\*\(\)\_\+\=\s]+/g;
  text = text.match(regex).join('-').toLowerCase();
  text = text.replace(/-{2,}/g, '-');
  return encodeURIComponent(text);
};


exports.filepath = function(fpath) {
  fpath = fpath.toLowerCase();
  fpath = fpath.replace(' ', '-');
  fpath = fpath.replace(/-{2,}/g, '-');
  return fpath;
};
