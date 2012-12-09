var path = require('path');

exports.source = __dirname;
exports.output = path.join(__dirname, '..', '_site');
exports.theme = path.join(__dirname, '..', '_themes', 'one');
exports.permalink = "{{directory}}/{{filename}}";

exports.writers = [
  path.join(__dirname, '..', 'lib', 'writer') + '.PostWriter'
]
