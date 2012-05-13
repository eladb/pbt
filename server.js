var path = require('path');
var fs = require('fs');
var express = require('express');
//var auth = require('connect-auth');
var fbapp = require('./fbapp');
var graph = require('fbgraph');
var grab = require('./grab');

var server = express.createServer();

var posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample.json')));

server.use(express.logger());
server.use(express.cookieParser());
server.use(express.session({ secret: 'gotya' }));
server.use(server.router);
server.use(express.static(path.join(__dirname, 'public')));

server.get('/login', function(req, res) {
  var fb = graph();

  var authUrl = fb.getOauthUrl({
    client_id: fbapp.app_id,
    redirect_uri: fbapp.callback_url,
  });

  res.redirect(authUrl);
});

server.get('/facebook/auth', function(req, res) {
  var fb = graph();

  fb.authorize({
    client_id: fbapp.app_id, 
    redirect_uri: fbapp.callback_url,
    client_secret: fbapp.app_secret,
    code: req.query.code
  }, function (err, token) {
    if (err) {
      console.error('authorization error:', err);
      return res.redirect('/unauthorized');
    }

    req.session.token = token;
    res.redirect('/');
  });
});

server.get('/facebook/channel', function(req, res) {
  // see: https://developers.facebook.com/docs/reference/javascript/
  var ttl = 60 * 60 * 24 * 365; // 1 year
  res.writeHead(200, {
    'pragma': 'public',
    'cache-control': 'max-age=' + ttl,
    'expires': (new Date(Date.now() + (ttl * 1000))).toGMTString(),
  });
  res.end('<script src="//connect.facebook.net/en_US/all.js"></script>');
});

// require authenticated users from here on

function auth(req, res, next) {
  if (!req.session || !req.session.token) {
    return res.send(403);
  }

  req.fb = graph();
  req.fb.setAccessToken(req.session.token.access_token);

  return next();
}

server.get('/logout', auth, function(req, res) {
  console.log('LOGOUT', req.session);
  req.session.destroy();
  req.fb = null;

  res.redirect('/');
  res.end();
});

server.get('/me', auth, function(req, res) {
  req.fb.get('/me', function(err, body) {
    res.send(body);
  });
});

server.get('/products', auth, function(req, res) {
  return grab(req.fb, function(err, products) {
    return res.send(products);
  });
});

server.get('/products/:id', auth, function(req, res) {
  var found = posts.filter(function(post) {
    return post.id == req.params.id;
  });

  if (!found || found.length === 0) {
    return res.send(404);
  }

  return res.send(found[0]);
});

server.listen(5000);