var mongoose = require("mongoose")
  , Schema = mongoose.Schema;

var singerSchema = new Schema({
	_id: Number,
	name: String,
	added: {type: Date, default: Date.now},
	first_name: String,
	last_name: String
});

var musicSchema = new Schema({
	_id: Number,
	user: {type: Number, ref: "User"},
	title: String,
	album: String,
	singer: String,
	year: Number,
	filepath: String,
	added: {type: Date, default: Date.now}
});

module.exports.Music = mongoose.model("Music", musicSchema);
module.exports.Singer = mongoose.model("Singer", singerSchema);