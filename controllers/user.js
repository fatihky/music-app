// Import image helpers for 'new' and 'edit' methods:
var fs = require("fs");
var images = require('./image');
var authenticate = require('./authenticate');
var User = require("../schemas/user");
var singerid = require("../models/singerid.js");
var lastid = require("../models/lastid");
var hashPassword = require("../models/user").hashPassword;
var checkUsername = require("../models/user").checkUsername;

module.exports = function(app) {
	// Handle access to the images page.
	// If the user is not logged in, redirect to the login page.
	app.get('/register', function(req, res) {
		res.send('<form action="/register" enctype="multipart/form-data" method="post">'
		+	'<input type="text" name="username" placeholder="User Name"/>		<br/>'
		+	'<input type="password" name="password" placeholder="Password"/>		<br/>'
		+	'<input type="password" name="password_repeat"'
		+	' placeholder="Password (repeat)"/><br/>'
		+	'<input type="submit" name="submit"/>	<br/>'
		+	'</form>');
	});
	
	app.post('/register', register);
	app.post('/ajax/register', ajax_register);

	app.get('/auth', function(req, res) {
		req.session.username = "fatih";
		req.session.user = "fatih";
		res.send('images/new');
	});

	app.get('/get-username', function(req, res) {
		res.send(req.session.username);
	});
};

function register(req, res)
{
	// Validation
	req.assert('username', "Please type a username").notEmpty();
	req.assert('password', "Please type a password").notEmpty();
	req.assert('password', "Password must contains 6 - 64 chars").len(6, 64);
	req.assert('password_repeat', "Passwords must be same").equals(req.body.password);
	var errors = req.validationErrors();
	if (errors) {
		res.send('There have been validation errors: ' + util.inspect(errors));
		return;
	}

	checkUsername(req.body.username, function(err, username_is_taken)
	{
		if(err == true) return res.end("internal server error");
		else if(username_is_taken == true) return res.end("username is taken");
	
		var user = new User();
		var hashedPassword = hashPassword(req.body.password);

		user.username = req.body.username;
		user.password = hashedPassword;

		req.session.username = req.body.username;

		lastid("user", function(err2, id){
			if(err2 == true) return res.end("not ok");
			else
			{
				user._id = id;
				user.save(function(err3, doc){
					if(err3 != null) return res.end("err3 ------");
					res.end("user saved " + doc);
				});
			}
		}); // lastid
	}); // checkUsername
}

function ajax_register(req, res)
{
	// Validation
	req.assert('username', "Please type a username").notEmpty();
	req.assert('password', "Please type a password").notEmpty();
	req.assert('password', "Password must contains 6 - 64 chars").len(6, 64);
	req.assert('password_repeat', "Passwords must be same").equals(req.body.password);

	var errors = req.validationErrors();

	if (errors) {
		var fields = []
		  , msgs = [];

		for (var i = 0; i < errors.length; i++) {
			msgs.push(errors[i].msg);
			fields.push(errors[i].param);
		};

		//res.json(["err", 'There have been validation errors: ' + util.inspect(errors)]);
		res.json(["err", fields, msgs]);

		return;
	}

	checkUsername(req.body.username, function(err, username_is_taken)
	{
		if(err == true) return res.json(["err", "internal server error"]);
		else if(username_is_taken == true) return res.json(["err", "username is taken"]);
	
		var user = new User();
		var hashedPassword = hashPassword(req.body.password);

		user.username = req.body.username;
		user.password = hashedPassword;

		lastid("user", function(err2, id){
			if(err2 == true) return res.json(["err", "not ok"]);
			else
			{
				user._id = id;
				user.save(function(err3, doc){
					if(err3 != null) return res.json(["err", "Internal server error. <br>" + err3]);
					var sess = {};
					sess._id = id;
					sess.username = req.body.username;
					req.session.user = sess;
					res.json(["ok", "you are successfully registered"]);
				});
			}
		}); // lastid
	}); // checkUsername
}sic", function(err2, id){
				// Success, save music to database
				music._id = id;
				music.save();
				// res.setHeader('Content-Type', 'text/html');
				var resContent = '<html><body>Upload done. <a href="uploadedFiles/' 
					+ req.files.file.name
					+ '">link to the file</a></body></html>';
				res.send(resContent);
			}); // lastid
		}); // fs.rename
	}); // singerid

}

var util = require('util'),
    express = require('express'),
    expressValidator = require('express-validator'),
    app = express();

app.use(express.bodyParser());
app.use(expressValidator);

app.post('/:urlparam', function(req, res) {

  req.assert('postparam', 'Invalid postparam').notEmpty().isInt();
  req.assert('getparam', 'Invalid getparam').isInt();
  req.assert('urlparam', 'Invalid urlparam').isAlpha();

  req.sanitize('postparam').toBoolean();

  var errors = req.validationErrors();
  if (errors) {
    res.send('There have been validation errors: ' + util.inspect(errors), 500);
    return;
  }
  res.json({
    urlparam: req.param('urlparam'),
    getparam: req.param('getparam'),
    postparam: req.param('postparam')
  });
});
