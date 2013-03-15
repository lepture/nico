/*
 * writers from outside
 *
 */


var fs = require('fs');
var path = require('path');
var util = require('util');
var BaseWriter = require('./base');

var log = require('../sdk/log');
var option = require('../sdk/option');

/* this writer is contributed by Hsiaoming Yang <lepture@me.com>
 *
 * you will need ganam to active this writer:
 *
 * $ npm install ganam -g
 *
 * {
 *   "ganam": {
 *     "source": "./styleguide",
 *     "output": "styleguide",
 *     "options": {
 *       "paths": ["./nib"]
 *     }
 *   },
 *   "writers": [
 *     "ganam/lib/writer.GanamWriter"
 *   ]
 * }
 *
 */

var ganamExt = /\.(styl|css)$/;
function GanamWriter() {
  this._styleguides = [];
  this._template = path.join(__dirname, '_templates', 'ganam-writer.html');
}
exports.GanamWriter = GanamWriter;

util.inherits(GanamWriter, BaseWriter);

GanamWriter.prototype.setup = function() {
  var ganam = require('ganam');

  var ganamConfig = option.get('ganam') || {};
  this._template = ganamConfig.template || this._template;

  var output = ganamConfig.output || 'styleguide';

  var guides = [];
  fs.readdirSync(ganamConfig.source).forEach(function(file) {
    if (!file.match(ganamExt)) return;
    var guide = ganam.styleSync(
      path.join(ganamConfig.source, file), ganamConfig.options
    );
    if (guide && guide.sections.length) {
      guide.file = file;
      guide.name = file.replace(ganamExt, '');
      guide.destination = path.join(output, guide.name + '.html');
      guides.push(guide);
      log.debug('ganam', guide.name);
    } else {
      log.warn('invalid', file);
    }
  });
  guides.sort(function(a, b) {
    return a.order - b.order;
  });
  this._styleguides = guides;
};

GanamWriter.prototype.run = function() {
  var self = this;
  self._styleguides.forEach(function(guide) {
    self.render({
      destination: guide.destination,
      params: {
        styleguides: self._styleguides,
        guide: guide
      },
      template: self._template
    });
  });
};
