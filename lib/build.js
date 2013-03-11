var post = require('./sdk/post');
var log = require('./sdk/log');
var option = require('./sdk/option');


module.exports = function(options) {
  options = options || {};

  Object.keys(options).forEach(key, function(key) {
    option.set(key, options[key]);
  });

  post.load();
}
