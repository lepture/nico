require('colorful').logging.level = 'disable';
module.exports = function(file) {
  if (process.env.NICO_COVERAGE) {
    file = file.replace('/lib/', '/lib-cov/');
  }
  return require(file);
};
