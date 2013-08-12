<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Frank's Dungeon Game O' Death</title>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	</head>
	<body>
		<!-- Facebook Integration -->
		<div id="fb-root"></div>
		<script>
			//Global variables for game
			var playerId = "";
			var playerAccessToken = "";
		
			//Init Facebook SDK
			window.fbAsyncInit = function() {
				// init the FB JS SDK
				FB.init({
				  appId      : '290465684427287',                        // App ID from the app dashboard
				  channelUrl : '//www.frankcaron.com/simplegame/channel.html', // Channel file for x-domain comms
				  status     : true,                                 // Check Facebook Login status
				  cookie     : true, // enable cookies to allow the server to access the session
				  xfbml      : true                                  // Look for social plugins on the page
				});

			  // Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
			  // for any authentication related change, such as login, logout or session refresh. This means that
			  // whenever someone who was previously logged out tries to log in again, the correct case below 
			  // will be handled. 
			  FB.Event.subscribe('auth.authResponseChange', function(response) {
				// Here we specify what we do with the response anytime this event occurs. 
				if (response.status === 'connected') {
				  // The response object is returned with a status field that lets the app know the current
				  // login status of the person. In this case, we're handling the situation where they 
				  // have logged in to the app.
				  playerAccessToken = response.authResponse.accessToken;
				  readyToPlay();
				} else if (response.status === 'not_authorized') {
				  // In this case, the person is logged into Facebook, but not into the app, so we call
				  // FB.login() to prompt them to do so. 
				  // In real-life usage, you wouldn't want to immediately prompt someone to login 
				  // like this, for two reasons:
				  // (1) JavaScript created popup windows are blocked by most browsers unless they 
				  // result from direct interaction from people using the app (such as a mouse click)
				  // (2) it is a bad experience to be continually prompted to login upon page load.
				   FB.login(function(response) {
					   // handle the response
					 }, {scope: 'publish_actions'});
				} else {
				  // In this case, the person is not logged into Facebook, so we call the login() 
				  // function to prompt them to do so. Note that at this stage there is no indication
				  // of whether they are logged into the app. If they aren't then they'll see the Login
				  // dialog right after they log in to Facebook. 
				  // The same caveats as above apply to the FB.login() call here.
				  FB.login(function(response) {
					   // handle the response
					 }, {scope: 'publish_actions'});
				}
			  });
			};

		  // Load the SDK asynchronously
		  (function(d){
		   var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
		   if (d.getElementById(id)) {return;}
		   js = d.createElement('script'); js.id = id; js.async = true;
		   js.src = "//connect.facebook.net/en_US/all.js";
		   ref.parentNode.insertBefore(js, ref);
		  }(document));

		  // Here we run a very simple test of the Graph API after login is successful. 
		  // This testAPI() function is only called in those cases. 
		  function readyToPlay() {
			FB.api('/me', function(response) {	  
			  	//Capture the userid
			  	playerId = response.id;
			  	
			  	//Draw the game
			  	drawGame();
			});
		  }
		  
		  //Add in the game
		  function drawGame() {
		  	$( ".gamespace" ).empty();
		  	$( ".gamespace" ).append("<script src='js/game.js'>");
		  	$( ".gamespace" ).append("</" + "script>");
		  	
		  	$( ".gamespace" ).append("<a href='index.php' onClick='FB.logout();'>Logout</a>");
		  }
		
		</script>
		
		<!-- Game -->
		<div class="gamespace" style="width: 700px; margin-left: auto; margin-right: auto; text-align: center;">
			<h3>Frank's Dungeon Game O' Death</h3>
			<p>Welcome to my game. Please log in with Facebook.</p>
			
			<!-- FB Button -->
			<fb:login-button scope="user_games_activity, publish_actions" show-faces="true" width="200" max-rows="1"></fb:login-button>
			
		</div>
	</body>
</html>