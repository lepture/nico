/**
 * The interface of nico.
 * @module nico
 * @example
 * // Get the nico object.
 * var nico = require('nico')
 */

exports = module.exports = require('./sdk/events');

/** Build interface of nico. */
exports.build = require('./build');

/** Server interface of nico. */
exports.server = require('./server');

/** Version of nico. */
exports.version = require('../package').version;

/** All sdk level API of nico. */
var sdk = exports.sdk = {};
sdk.option = require('./sdk/option');
sdk.file = require('./sdk/file');
sdk.post = require('./sdk/post');
sdk.markdown = require('./sdk/markdown');
sdk.highlight = require('./sdk/highlight');
sdk.encode = require('./sdk/encode');
sdk.filters = require('./sdk/filters');
sdk.log = require('./sdk/log');

exports.option = sdk.option.option;

/** All writers of nico. */
var writers = require('./writers');
Object.keys(writers).forEach(function(key) {
  exports[key] = writers[key];
});
