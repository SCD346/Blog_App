// Require exports INTO App.js




var fs = require ( 'fs' )
var express = require ( 'express' )
var app = express()
var bodyParser = require('body-parser');

//CSS and js files from public
app.use(express.static('./public/js'));

app.use(bodyParser.urlencoded({ extended:true }))

// Pug files.
app.set('views', './views');  
app.set('view engine', 'pug');

var pg = require('pg'); // require postgres

//ConnetionString to database:
// var connectionString = 'postgres://jon:mypassword@localhost/bulletin_board_app';
var connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/bulletin_board_app';

//homepage
app.get('/', function (req, res) {
	console.log("connection String")
	res.render('index', {
		title: "Blog-app"
	});
})




