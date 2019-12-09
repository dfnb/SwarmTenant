var express = require('express');
var bodyParser = require('body-parser')
var app = express();

var t = {
	  "message": "Something went wrong."
}
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/:user/*', function (req, res) {
	console.log(req.params)
	console.log(req.url)
	console.log(req.body)
	res.status(500).json(t)
	  //res.send(JSON.stringfy({"message": "Something went wrong."}));
});

app.listen(2375, function () {
	  console.log('Example app listening on port 3000!');
});

