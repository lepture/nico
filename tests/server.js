var server = require('..').server;

describe('server', function() {
  it('can serve the site', function(done) {
    server({}, function(err, app) {
      app.listen(9876, function() {
        app.close();
        done();
      });
    });
  });
});
