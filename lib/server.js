var fs = require('fs');
var url = require('url');
var path = require('path');
var log = require('./sdk/log');
var option = require('./sdk/option');
var events = require('./sdk/events');
var mimetypes = require('./mimetypes');
var middlewares;

module.exports = createServer;

var build = require('./build');
function createServer(options, callback) {
  var fn = function() {
    build(options);
  };
  fn();

  // save the middlewares for server
  middlewares = build.parseArgs(options).middlewares || [];

  var app = require('http').createServer(handler);

  if (options.watch) {
    createWatch(app, fn);
  }

  log.info('server', 'http://127.0.0.1:' + options.port);
  app.listen(options.port).on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
      log.error('error', 'this port is in use, change to another one');
    } else {
      throw e;
    }
  });

  callback && callback(null, app);
}

var io;
var file = require('./sdk/file');
function createWatch(app, fn) {
  try {
    io = require('socket.io').listen(app, {log: false});
  } catch(e) {
    log.warn('warn', 'npm install socket.io to enable livereload');
  }

  var lastChanged = new Date();
  var sockets = [];

  var rebuild = function(message) {
    if ((new Date() - lastChanged) > 1800) {
      fn();
      sockets.forEach(function(socket){
        socket && !socket.disconnected && socket.emit('reload', {message: message});
      });
      lastChanged = new Date();
    }
  };

  if (io) {
    io.sockets.on('connection', function(socket) {
      socket.emit('hello', {message: 'nico'});

      sockets.push(socket);
    });
  }

  events.on('sourceModified', function(message) {
    rebuild(message);
  });
  events.on('themeModified', function(message) {
    rebuild(message);
  });

  var sourcedir = option.get('sourcedir');
  log.info('watch', sourcedir);

  var _src = {};
  file.recurse(sourcedir, function(filepath, r, s) {
    var d = path.join(r, s || '');
    if (_src[d]) return;
    _src[d] = true;
    fs.watch(d, function(event, filename) {
      log.info(event, filename);
      events.emit('sourceModified', filename);
    });
  });

  var themedir = option.get('theme');
  log.info('watch', themedir);

  var _theme = {};
  file.recurse(themedir, function(filepath, r, s) {
    var d = path.join(r, s || '');
    if (_theme[d]) return;
    _theme[d] = true;
    fs.watch(d, function(event, filename) {
      log.info(event, filename);
      events.emit('themeModified', filename);
    });
  });
}


function handler(req, res) {

  var stack = middlewares;
  var index = 0;

  var file = url.parse(req.url).pathname.slice(1);
  if (!file || file.slice(-1) === '/') {
    file = path.join(file, 'index.html');
  }
  var outputdir = option.get('outputdir');

  var ext = path.extname(file).slice(1);

  function next() {
    // next callback
    var middleware = stack[index++];

    // all done
    if (!middleware || res.headersSent) {

      if (!mimetypes[ext]) {
        if (fs.existsSync(path.join(outputdir, file + '.html'))) {
          ext = 'html';
          file = file + '.html';
        }
        if (fs.existsSync(path.join(outputdir, file + '.xml'))) {
          ext = 'xml';
          file = file + '.xml';
        }
      }
      file = decodeURIComponent(file);

      res.setHeader("Content-Type", mimetypes[ext]);

      var encode;
      if (ext === 'html') {
        encode = 'utf-8';
      }
      var code = [
        '<script src="/socket.io/socket.io.js"></script><script>',
        'var socket = io.connect("/");',
        'socket.on("reload", function() { location.reload() });',
        '</script></body>'
      ].join('');
      fs.readFile(
        path.join(outputdir, file), encode,
        function(err, data) {
          if (err) {
            if (fs.existsSync(path.join(outputdir, file, 'index.html'))) {
              res.writeHead(302, {
                'Location': req.url + '/'
              });
              return res.end();
            }
            res.writeHead(404);
            log.warn('404', req.url);
            return res.end('Not Found');
          }
          res.writeHead(200);
          if (encode === 'utf-8') {
            data = data.replace('ga.src', '// ga.src');
            // iframe pages don't need socket.io
            if (io && !/iframe-[\d]+\.html$/.test(url.parse(req.url).path)) {
              data = data.replace('</body>', code);
            }
          }
          log.info('200', req.url);
          res.end(data);
        }
      );

      return;
    }

    // skip this layer if the route doesn't match.
    if (typeof middleware.filter === 'string') {
      if (req.url.indexOf(middleware.filter.toLowerCase()) < 0) return next();
    } else {
      if (!middleware.filter.test(req.url)) return next();
    }

    log.info('middleware', (middleware.name || 'anonymous ') + ' ' + req.url);
    middleware.handle(req, res, next);

  }

  next();

}
