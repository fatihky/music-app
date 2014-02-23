var Singer = require("../schemas/music").Singer;

module.exports = function(name, callback)
{
	Singer.findOne({name: name}).exec(function(err, singer){
		if(err != null || singer == null)
		{
			return callback(true);
		}
		return callback(false, singer._id);
	})
}