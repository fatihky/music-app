// Import image helpers for 'new' and 'edit' methods:
var fs = require("fs");
var images = require('./image');
var authenticate = require('./authenticate');
var Music = require("../schemas/music.js").Music;
var singerid = require("../models/singerid.js");
var lastid = require("../models/lastid");

module.exports = function(app) {
	// Handle access to the images page.
	// If the user is not logged in, redirect to the login page.
	app.get('/images', authenticate.restrict, function(req, res) {
	  images.list(function(err, image_list) {
		res.send('images/index ' + image_list)
	  });
	});

	app.get('/musics', function(req, res){
	    var options = {
    		perPage: 10,
    		delta  : 3,
    		page   : req.query.p || 1
    	};

	    var query = Music.find({user: req.session.user._id});
    	query.paginate(options, function(err, response) {
    		console.log(response); // => res = {
    		//  options: options,               // paginate options
    		//  results: [Document, ...],       // mongoose results
    		//  current: 5,                     // current page number
    		//  last: 12,                       // last page number
    		//  prev: 4,                        // prev number or null
    		//  next: 6,                        // next number or null
    		//  pages: [ 2, 3, 4, 5, 6, 7, 8 ], // page numbers
    		//  count: 125                      // document count
    		//};
    		res.send(JSON.stringify(response))
    	});
	});

	app.get("/get-playlist", get_playlist);

	// Delete music
	app.get('/del-music/:music_id', authenticate.restrict, del_music);

	// Add new music
	app.post('/add-music', add_music);

	app.get("/add-music", authenticate.restrict, function(req, res){
		res.send('<form action="/add-music" enctype="multipart/form-data" method="post">'
		+	'<input type="text" name="title" placeholder="Title"/>		<br/>'
		+	'<input type="text" name="singer" placeholder="Singer"/>		<br/>'
		+	'<input type="text" name="album" placeholder="Album"/>		<br/>'
		+	'<input type="text" name="year" placeholder="Year"/>		<br/>'
		+	'<input type="file" name="file"/>		<br/>'
		+	'<input type="submit" name="submit"/>		<br/>'
		+	'</form>');
	})
};

function get_playlist(req, res)
{
	if(req.session.user)
	{
	    var options = {
    		perPage: 50,
    		delta  : 3,
    		page   : req.query.p || 1
    	};

	    var query = Music.find({user: req.session.user._id});
	    query.select({title: 1, filepath: 1, singer: 1, _id: 1, year: 1
	    	, album: 1});
    	query.paginate(options, function(err, response) {
    		//  console.log(response); // => res = {
    		//  options: options,               // paginate options
    		//  results: [Document, ...],       // mongoose results
    		//  current: 5,                     // current page number
    		//  last: 12,                       // last page number
    		//  prev: 4,                        // prev number or null
    		//  next: 6,                        // next number or null
    		//  pages: [ 2, 3, 4, 5, 6, 7, 8 ], // page numbers
    		//  count: 125                      // document count
    		//};
    		
    		response.auth = true;
    		res.json(response);
    		//res.send(JSON.stringify(response))
    	});

		// res.json(["ok", ["deneme"]]);
	} else {
		res.json(["ok", ["deneme"]]);
	}
}

function add_music(req, res)
{
	if(!req.session.user)
	{
		if(req.get("X-Requested-With") == "XMLHttpRequest")
		{
			res.send(401);
			return;
		}
		res.redirect("/login");
		return;
	}

	// Validation
	req.assert('title', 'Title can not be null and can not contains more than 64 chars')
	   .len(1, 64);
	req.assert('album', 'Album name can not contains more than 64 chars').len(0, 64);
	req.assert('singer', "Singer's name can not contains more than 64 chars").len(0, 64);
	if(req.body.year)
		req.assert('year', "Year is have to be a number").isInt();

	// Check errors
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

	if(req.files == null || req.files == "undefined"
		|| req.files.file == null || req.files.file == "undefined"
		|| req.files.file.size == 0)
	{
		res.json(["err", "file is required"]);
		return;
	}

	var music = new Music();
	music.title = req.body.title;
	if(req.body.album) music.album = req.body.album;
	if(req.body.year) music.year = req.body.year;
	music.singer = req.body.singer;

	var filepath = new String(req.session.user.username + "-"
		+ Date.now() + "-" + req.files.file.name);

	// save file to upload directory
	var fileDestPath = __dirname
		+ "/../public/uploads/music/" + filepath;
	fs.rename(req.files.file.path, fileDestPath, function(err) {
		if (err) {
			// Delete the temp file.
			fs.unlink(req.files.file.path, function(err2) {
				if (err2) {
					throw err2;
				}
			});
			throw err;
		}

		lastid("music", function(err2, id){
			// Success, save music to database
			music._id = id;
			music.user = req.session.user._id;
			music.filepath = filepath;
			music.save();

			music.msg = "your music is added";

			var item = new Object();
			item.msg = "your music is added";
			item.title = req.body.title;
			item.filepath = music.filepath;
			item._id = id;

			console.log(item);

			res.json(["ok", item]);
		}); // lastid
	}); // fs.rename

}

function del_music(req, res)
{
	req.assert("music_id", "Music id must be a number.").isInt();

	var errors = req.validationErrors();

	if(errors)
	{
		return res.redirect("/musics");
	}

	res.type("aplication/json");

	Music.findOne({_id: req.params.music_id}).exec(function(err, music){
		if(err) return res.end("internal server error");

		var filepath = music.filepath;

		if(music && req.session.user._id == music.user)
		{
			Music.remove({_id: req.params.music_id}).exec(function(err, is_deleted)
			{
				if(err)			return res.end('"internal server error"');
				if(is_deleted)	
				{
					fs.unlink(
					  __dirname + "/../public/uploads/music/" + filepath
					  , function(err2) {
						if (err2) {
							throw err2;
						}
						return res.end('"music is deleted"');
					});
				}
			}) // Music.remove
		} // if(req.session.user._id == music.user)

		else res.end('"music is not in your archive"');

	}); // Music.findOne
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

app.listen(9798);

/*
    require('mongoose-query-paginate');
    var options = {
      perPage: 10,
      delta  : 3,
      page   : req.query.p
    };
    var query = MyModel.find({deleted: false}).sort('name', 1);
    query.paginate(options, function(err, res) {
      console.log(res); // => res = {
        //  options: options,               // paginate options
        //  results: [Document, ...],       // mongoose results
        //  current: 5,                     // current page number
        //  last: 12,                       // last page number
        //  prev: 4,                        // prev number or null
        //  next: 6,                        // next number or null
        //  pages: [ 2, 3, 4, 5, 6, 7, 8 ], // page numbers
        //  count: 125                      // document count
      //};
    });
*/