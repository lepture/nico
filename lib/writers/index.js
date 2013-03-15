exports = module.exports = require('./core');
exports.BaseWriter = require('./base');

var writers = require('./contrib');
Object.keys(writers).forEach(function(key) {
  exports[key] = writers[key];
});
