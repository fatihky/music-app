var auth = require('./authenticate');
module.exports = function(app) {
	// Manage user login:
	app.get('/login', function(req, res) {
		// If the user is already logged in,
		//   redirect to homepage
		if (req.session.user) {
			res.redirect('/');
		} else {
			// Otherwise send him to the login page.
			res.send('<form action="/login" enctype="multipart/form-data" method="post">'
			+	'<input type="text" name="username" placeholder="username"/>		<br/>'
			+	'<input type="password" name="password" placeholder="password"/>		<br/>'
			+	'<input type="submit" name="submit" value="Login"/>		<br/>'
			+	'</form>');
		}
	});
	
	// Handle the posting of the username and password.
	app.post('/login', function (req, res) {
		// Retrive the username and password from the request body.
		auth.authenticate(req.body.username, req.body.password, function(err, user) {
			// If the username entered is legit, validate session.
			if (user) {
				// Regenerate session when signing in
				// to prevent fixation 
				req.session.regenerate(function() {
					/*
						Store the user's primary key 
						in the session store to be retrieved,
						or in this case the entire user object,
					*/
					req.session.user = user;

					res.end('authendicated!');
				});
			} else {
				// Otherwise, user entered wrong username, so redirect back to login with a message.
				req.end('Authentication failed. Please check your username and password.');
			}
		});
	});

	// Logout the user:
	app.get('/logout', function(req, res) {
	  // Destroy the user's session to log them out.
	  // Will be re-created next request.
	  req.session.destroy(function() {
		res.redirect('/login');
	  });
	});

	app.get('/ajax/get-auth', function(req, res) {
		if(req.session.user)
		{
			res.json({auth: true});
		} else {
			res.json({auth: false});
		}
	});

	// Handle the posting of the username and password (ajax).
	app.post('/ajax/login', function (req, res) {
		// Retrive the username and password from the request body.
		auth.authenticate(req.body.username, req.body.password, function(err, user) {
			// If the username entered is legit, validate session.
			if (user) {
				// Regenerate session when signing in
				// to prevent fixation 
				req.session.regenerate(function() {
					/*
						Store the user's primary key 
						in the session store to be retrieved,
						or in this case the entire user object,
					*/
					req.session.user = user;

					res.json({auth: true});
				});
			} else {
				// Otherwise, user entered wrong username, so redirect back to login with a message.
				res.json({auth: false});
			}
		});
	});

	// Logout the user(with ajax):
	app.get('/ajax/logout', function(req, res) {
	  // Destroy the user's session to log them out.
	  // Will be re-created next request.
	  req.session.destroy(function() {
		res.json({auth: false});
	  });
	});

};