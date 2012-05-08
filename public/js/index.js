$(function() {
  var god = godframework();

  var product_item_tpl = $('#tpl-product-list-item').html();

  god.match(/\/products\/.+/, function(err, req) {
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

  })
});

// --- god starts here

function godframework() {
  var god = new EventEmitter();

  var _emit = god.emit;
  var _res = [];

  god.match = function(re, fn) {
    _res.push({ re: re, fn: fn });
    return this;
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

  $(window).bind('hashchange', function() {
    var url = location.hash.substring(1);
    
    var ajax = $.get(url);
    
    var req = { url: url };

    ajax.success(function(body) { 
      req.body = body;
      god.emit(url, null, req);
    });

    ajax.error(function(err) { 
      req.error = { err: { status: err.status, statusText: err.statusText } };
      god.emit(url, req.error, req);
    });

  });

  $(window).trigger('hashchange');

  return god;
}