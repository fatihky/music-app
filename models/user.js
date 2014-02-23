var Hashes = require('jshashes')
  , lastid = require("./lastid")
  , User = require("../schemas/user");

// new SHA512 instace
var SHA512 = new Hashes.SHA512;
module.exports.checkUsername = function(username, cb){
	User.findOne({username: username}).exec(function(err, doc){
		if(err != null) return cb(true); // have an error(s)

		if(doc != null) return cb(false, true); // no errors, username is taken

		cb(false, false); // no error, username is not taken
	})
};

module.exports.hashPassword = function(password)
{
	return SHA512.b64(password);
}