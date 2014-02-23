"["
            "{\"src\": \"retro/media/birlesme.mp3\", \"type\": \"auido/mp3\"},"
            "{\"src\": \"retro/media/barutkokusu.mp3\", \"type\": \"auido/mp3\"},"
            "{\"src\": \"retro/media/askvefirtina.mp3\", \"type\": \"auido/mp3\"}"
        "]"

module.exports = function(app)
{
	app.get("/api/v1/get-playlist", function(req, res){
		res.json([
			{src: "/media/birlesme.mp3", type: "auido/mp3"},
			{src: "/media/barutkokusu.mp3", type: "auido/mp3"},
			{src: "/media/askvefirtina.mp3", type: "auido/mp3"}
		]);
	});
}