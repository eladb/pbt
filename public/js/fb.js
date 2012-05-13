// Load the SDK Asynchronously
(function(d){
   var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement('script'); js.id = id; js.async = true;
   js.src = "//connect.facebook.net/en_US/all.js";
   ref.parentNode.insertBefore(js, ref);
}(document));

window.fbAsyncInit = function() {
  FB.init({
    appId: '305994549480898',
    channelUrl: '//' + window.location.hostname + '/facebook/channel',
    status: true,
    cookie: true,
    xfbml: true
  });
/*
  // listen for and handle auth.statusChange events
  FB.Event.subscribe('auth.statusChange', function(response) {
    if (response.authResponse) {
      FB.api('/me', function(me){
        if (me.name) $('#auth-displayname').html(me.name);
      });

      $('#auth-loggedout').hide();
      $('#auth-loggedin').show();
    } else {
      $('#auth-loggedout').show();
      $('#auth-loggedin').hide();
    }
  });

  // respond to clicks on the login and logout links
  $('#auth-loginlink').click(function() { FB.login(); });
  $('#auth-logoutlink').click(function() { FB.logout(); });*/
}