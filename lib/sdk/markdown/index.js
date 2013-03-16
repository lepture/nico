if (process.env.NICO_COVERAGE=1) {
  module.exports = require('./marked');
} else if (process.env.NICO_COVERAGE=2) {
  module.exports = require('./robotskirt');
} else {
  try {
    module.exports = require('./robotskirt');
  } catch (e) {
    module.exports = require('./marked');
  }
}
