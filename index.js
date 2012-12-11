var reader = require('./lib/reader');
exports.Post = reader.Post;

var writer = require('./lib/writer');
for (var key in writer) {
  exports[key] = writer[key];
}
