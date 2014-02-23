var Lastid = require("../schemas/lastid");

module.exports = function(name, callback)
{
	Lastid.findOne({_id: name}).exec(function(err, doc){
		if(err)
			return callback(true);
		if(doc == null)
		{
			var lastid = new Lastid({_id: name, id: 1});
			lastid.save(function(err){
				if(err) return callback(true);
				else return callback(false, 1);
			})
		}
		else
		{
			var newid = doc.id + 1;
			doc.id = newid;

			doc.save(function(err2){
				if(err2 == null) callback(false, newid);
				else callback(true);
			});
		}
	});
}