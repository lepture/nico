var post = require('./sdk/post');
var log = require('./sdk/log');
var file = require('./sdk/file');
var option = require('./sdk/option');
var filters = require('./sdk/filters');


module.exports = function(options) {
  options = options || {};

  // transform source to sourcedir, output to outputdir
  ['source', 'output'].forEach(function(key) {
    if (options[key]) {
      options[key + 'dir'] = options[key];
      delete options[key];
    }
  });

  Object.keys(options).forEach(function(key) {
    option.set(key, options[key]);
  });

  // load filters and functions
  option.set('filters', filters.filters);
  option.set('contextfunctions', filters.contextfunctions);

  // call start of writers
  var writers = option.get('writers') || [];
  writers = writers.map(function(item) {
    var fn = file.require(item);
    if (!fn) {
      log.error('load', 'fail to load ' + item);
      return;
    }
    fn = new fn();
    fn.start && fn.start();
    return fn;
  });
  // load posts
  post.load();

  // run the end of the writers
  writers.forEach(function(fn) {
    fn && fn.stop && fn.stop();
  });
};
