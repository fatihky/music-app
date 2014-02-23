var mongoose = require("mongoose")
  , Schema = mongoose.Schema;

var lastidSchema = new Schema({
	_id: String,
	name : String,
	id : Number
});

module.exports = mongoose.model("Lastid", lastidSchema);