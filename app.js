// Debugging stuff
Object.defineProperty(global, "__stack", {
	get: function(){
		var orig = Error.prepareStackTrace;
		Error.prepareStackTrace = function(_, stack)
		{
			return stack;
		};
		var err = new Error();
		Error.captureStackTrace(err, arguments.callee);
		var stack = err.stack;
		Error.prepareStackTrace = orig;
		return stack;
	}
});

Object.defineProperty(global, "__line", {
	get: function(){
		return __stack[1].getLineNumber();
	}
});

Object.defineProperty(global, "__function", {
	get: function(){
		return __stack[1].getFunctionName();
	}
});


/*
function foo()
{
	console.log(__line + " " + __function);
	
	console.log(__line);
}
*/

/*  Module dependencies  */
var express = require('express');

/*  Server setup  */
// Create an instance of the server:
var app = express();

// Import configuration settings and initialize server:
require('./controllers/configuration').setup(app);

// Import mongoose schemas
//require("./schemas/music");

/*  Handle routes:  */
// Handle access to the main page
require('./controllers/index')(app);

// Import routes for user operations (register):
require('./controllers/user')(app);

// Import routes for login/logout:
require('./controllers/login')(app);

// Import routes for api:
require('./controllers/api')(app);

// Import routes for products:
require('./controllers/products')(app);

// Import routes for images:
require('./controllers/images')(app);

// Import routes for music:
require('./controllers/music')(app);


/* Route Error Handling  */
// If the route provided was not trapped by the previous handlers,
// render it as a 404 error page.
app.use(function(req, res, next) {
  // respond with html page
  res.send('404');
  return;
});

// Connect to
var mongoose = require("mongoose");
mongoose.connect("localhost/music");

// Tell the server what port to listen to.
app.listen(4444);
console.log('Express server listening on port %d in %s mode', 4444, app.settings.env);