exports = module.exports = require('./sdk/events');

exports.build = require('./build');
exports.server = require('./server');
exports.version = require('../package').version;

// export sdk
var sdk = exports.sdk = {};
sdk.option = require('./sdk/option');
sdk.file = require('./sdk/file');
sdk.post = require('./sdk/post');
sdk.markdown = require('./sdk/markdown');
sdk.highlight = require('./sdk/highlight');
sdk.encode = require('./sdk/encode');
sdk.filters = require('./sdk/filters');
sdk.log = require('./sdk/log');

// export writers
var writers = require('./writers');
Object.keys(writers).forEach(function(key) {
  exports[key] = writers[key];
});
