var log = require('../log');

try {
  module.exports = require('./robotskirt');
  log.debug('load', 'robotskirt');
} catch (e) {
  module.exports = require('./marked');
  log.debug('load', 'marked');
}
