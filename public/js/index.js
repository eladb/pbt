$(function() {
  var god = godframework();

  var product_item_tpl = $('#tpl-product-list-item').html();

  god.on(/\/products\/.+/, function(err, req) {
    console.log('url:', req.url);
    console.log('data:', req.body);
  });

  god.on('/products', function(err, req) {
    var products = req.body;

    $('#list').empty();
    products.forEach(function(product) {
      product.has_comments = product.comments && product.comments.length > 0;
      var x = Mustache.render(product_item_tpl, product);
      $('#list').append($(x));
    });
  });

  $('#auth-logout').hide();
  $('#auth-login').hide();
  god.get('/me');

  god.on('/me', function(err, req) {
    if (err) {
      $('#auth-logout').hide();
      $('#auth-login').show();
      return;
    }
    
    $('#auth-login').hide();
    $('#auth-logout').show();
    $('#auth-displayname').html(req.body.name);
  });
});

// --- god starts here

function godframework() {
  var god = new EventEmitter();

  var _on = god.on;
  var _emit = god.emit;
  var _res = [];

  god.on = function(re, fn) {
    if (typeof re === 'object' && re.test) {
      _res.push({ re: re, fn: fn });
      return this;
    }
    else {
      return _on.apply(this, arguments);
    }
  };

  god.emit = function(evt) {

    var args = [];
    for (var i = 1; i < arguments.length; ++i) {
      args[i - 1] = arguments[i];
    }

    _res
      .filter(function(s) { 
        return s.re.test(evt); 
      })
      .forEach(function(s) { 
        s.fn.apply(null, args); 
      });

    return _emit.apply(this, arguments);
  };

  god.get = function(url) {
    console.log('fetch', url);

    var req = { url: url };
    var ajax = $.get(url);
    ajax.success(function(body) { 
      req.body = body;
      god.emit(url, null, req);
    });

    ajax.error(function(err) { 
      req.error = { err: { status: err.status, statusText: err.statusText } };
      god.emit(url, req.error, req);
    });
  };

  $(window).bind('hashchange', function() {
    var url = location.hash.substring(1);
    god.get(url);    
  });

  $(window).trigger('hashchange');

  return god;
}