if (process.env.NICO_COVERAGE) {
  module.exports = require('./lib-cov/');
} else {
  module.exports = require('./lib/');
}
