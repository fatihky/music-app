var mongoose = require("mongoose")
  , Schema = mongoose.Schema;

var userSchema = new Schema({
	_id: Number,
	username: String,
	password: String,
	added: {type: Date, default: Date.now},
});

module.exports = mongoose.model("User", userSchema);
