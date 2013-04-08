var fs = require('fs');
var url = require('url');
var path = require('path');
var log = require('./sdk/log');
var option = require('./sdk/option');
var events = require('./sdk/events');

module.exports = createServer;

var build = require('./build');
function createServer(options) {
  var fn = function() {
    build(options);
  };
  fn();

  var app = require('http').createServer(handler);

  if (options.watch) {
    createWatch(app, fn);
  }

  log.info('server', 'http://127.0.0.1:' + options.port);
  app.listen(options.port);
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

  var rebuild = function(socket, message) {
    if ((new Date() - lastChanged) > 1800) {
      fn();
      socket && socket.emit('reload', {message: message});
    }
    lastChanged = new Date();
  };

  if (io) {
    io.sockets.on('connection', function(socket) {
      socket.emit('hello', {message: 'nico'});

      events.on('sourceModified', function(message) {
        rebuild(socket, message);
      });
    });
  } else {
    events.on('sourceModified', function(message) {
      rebuild();
    });
  }

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


// copy from node-static
var mimetypes = {
  "aiff": "audio/x-aiff",
  "arj": "application/x-arj-compressed",
  "appcache": "text/cache-manifest",
  "asf": "video/x-ms-asf",
  "asx": "video/x-ms-asx",
  "au": "audio/ulaw",
  "avi": "video/x-msvideo",
  "bcpio": "application/x-bcpio",
  "ccad": "application/clariscad",
  "cod": "application/vnd.rim.cod",
  "com": "application/x-msdos-program",
  "cpio": "application/x-cpio",
  "cpt": "application/mac-compactpro",
  "csh": "application/x-csh",
  "css": "text/css",
  "deb": "application/x-debian-package",
  "dl": "video/dl",
  "doc": "application/msword",
  "drw": "application/drafting",
  "dvi": "application/x-dvi",
  "dwg": "application/acad",
  "dxf": "application/dxf",
  "dxr": "application/x-director",
  "etx": "text/x-setext",
  "ez": "application/andrew-inset",
  "fli": "video/x-fli",
  "flv": "video/x-flv",
  "gif": "image/gif",
  "gl": "video/gl",
  "gtar": "application/x-gtar",
  "gz": "application/x-gzip",
  "hdf": "application/x-hdf",
  "hqx": "application/mac-binhex40",
  "htm": "text/html",
  "html": "text/html",
  "ice": "x-conference/x-cooltalk",
  "ico": "image/x-icon",
  "ief": "image/ief",
  "igs": "model/iges",
  "ips": "application/x-ipscript",
  "ipx": "application/x-ipix",
  "jad": "text/vnd.sun.j2me.app-descriptor",
  "jar": "application/java-archive",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "latex": "application/x-latex",
  "less": "text/css",
  "lsp": "application/x-lisp",
  "lzh": "application/octet-stream",
  "m": "text/plain",
  "m3u": "audio/x-mpegurl",
  "man": "application/x-troff-man",
  "manifest": "text/cache-manifest",
  "me": "application/x-troff-me",
  "midi": "audio/midi",
  "mif": "application/x-mif",
  "mime": "www/mime",
  "movie": "video/x-sgi-movie",
  "mp4": "video/mp4",
  "mpg": "video/mpeg",
  "mpga": "audio/mpeg",
  "ms": "application/x-troff-ms",
  "nc": "application/x-netcdf",
  "oda": "application/oda",
  "oga": "audio/ogg",
  "ogg": "application/ogg",
  "ogm": "application/ogg",
  "ogv": "video/ogg",
  "pbm": "image/x-portable-bitmap",
  "pdf": "application/pdf",
  "pgm": "image/x-portable-graymap",
  "pgn": "application/x-chess-pgn",
  "pgp": "application/pgp",
  "pm": "application/x-perl",
  "png": "image/png",
  "pnm": "image/x-portable-anymap",
  "ppm": "image/x-portable-pixmap",
  "ppz": "application/vnd.ms-powerpoint",
  "pre": "application/x-freelance",
  "prt": "application/pro_eng",
  "ps": "application/postscript",
  "qt": "video/quicktime",
  "ra": "audio/x-realaudio",
  "rar": "application/x-rar-compressed",
  "ras": "image/x-cmu-raster",
  "rgb": "image/x-rgb",
  "rm": "audio/x-pn-realaudio",
  "rpm": "audio/x-pn-realaudio-plugin",
  "rtf": "text/rtf",
  "rtx": "text/richtext",
  "scm": "application/x-lotusscreencam",
  "set": "application/set",
  "sgml": "text/sgml",
  "sh": "application/x-sh",
  "shar": "application/x-shar",
  "silo": "model/mesh",
  "sit": "application/x-stuffit",
  "skt": "application/x-koan",
  "smil": "application/smil",
  "snd": "audio/basic",
  "sol": "application/solids",
  "spl": "application/x-futuresplash",
  "src": "application/x-wais-source",
  "stl": "application/SLA",
  "stp": "application/STEP",
  "sv4cpio": "application/x-sv4cpio",
  "sv4crc": "application/x-sv4crc",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tar": "application/x-tar",
  "tcl": "application/x-tcl",
  "tex": "application/x-tex",
  "texinfo": "application/x-texinfo",
  "tgz": "application/x-tar-gz",
  "tiff": "image/tiff",
  "tr": "application/x-troff",
  "tsi": "audio/TSP-audio",
  "tsp": "application/dsptype",
  "tsv": "text/tab-separated-values",
  "txt": "text/plain",
  "unv": "application/i-deas",
  "ustar": "application/x-ustar",
  "vcd": "application/x-cdlink",
  "vda": "application/vda",
  "vivo": "video/vnd.vivo",
  "vrm": "x-world/x-vrml",
  "wav": "audio/x-wav",
  "wax": "audio/x-ms-wax",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "wmx": "video/x-ms-wmx",
  "wrl": "model/vrml",
  "wvx": "video/x-ms-wvx",
  "xbm": "image/x-xbitmap",
  "xlw": "application/vnd.ms-excel",
  "xml": "text/xml",
  "xpm": "image/x-xpixmap",
  "xwd": "image/x-xwindowdump",
  "xyz": "chemical/x-pdb",
  "zip": "application/zip"
};

function handler(req, res) {
  var file = url.parse(req.url).pathname.slice(1);
  if (!file || file.slice(-1) === '/') {
    file = path.join(file, 'index.html');
  }
  var outputdir = option.get('outputdir');

  var ext = path.extname(file).slice(1);

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
        if (io) {
          data = data.replace('</body>', code);
        }
      }
      log.info('200', req.url);
      res.end(data);
    }
  );
}
