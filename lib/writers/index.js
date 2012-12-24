exports = module.exports = require('./core');
exports.BaseWriter = require('./base').BaseWriter;

var contrib = require('./contrib');
for (var writer in contrib) {
  exports[writer] = contrib[writer];
}
