// Require exports INTO App.js
const express = require('express'),
    bodyParser = require('body-parser'),
    pug = require('pug'),
    sequelize = require('sequelize'),
    session = require('express-session')
    // fs = require ( 'fs' )

const app = express()

//CSS and js files from public
app.use(express.static('./public/js'));

app.use(bodyParser.urlencoded({ extended:true }))

// Pug files.
app.set('views', './views');  
app.set('view engine', 'pug');

var pg = require('pg'); // require postgres


//ConnetionString to database:
// var db = 'postgres://jon:mypassword@localhost/blog_app';
const db = new Sequelize('postgres://jon:mypassword@localhost/blog_app');


//ConnetionString to db:
// var connectionString = 'postgres://jon:mypassword@localhost/bulletin_board_app';
// var connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/bulletin_board_app';


//database parameters
// const db = new sequelize('blog_app', 'stephendoherty', 'null', {
//     host: 'localhost',
//     dialect: 'postgres'
// })



// set up session?
app.use(session({
    secret: 'oh wow very secret much security',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}))









// USERS: Creates a table in db for users.
let users = db.define('users', {
    username: sequelize.STRING,
    password: sequelize.STRING,
    firstname: sequelize.STRING,
    lastname: sequelize.STRING,
    email: sequelize.STRING
})



// POSTS: Creates a table in the db for blog posts.
let posts = db.define('posts', {
	title: sequelize.STRING,
	body: sequelize.TEXT
})



// COMMENTS: Creates a table in the db for users' comments on blog posts.
let comments = db.define('comments', {
	body: sequelize.STRING
})


// RELATIONSHIPS among users, blog posts and comments
posts.belongsTo(users) //users make posts
posts.hasMany(comments) //many comments (from many users) can be on a blog post
users.hasMany(posts) //users can make many posts
users.hasMany(comments) //users can make many comments
comments.belongsTo(users) //users make comments
comments.belongsTo(posts) //comments are tied to posts



//parse the input in the forms
app.use(bodyParser.urlencoded({
    extended: false
}))



//renders 'allblogs.pug'
app.get('/', (req, res) => {
    posts.findAll().then((posts) => {
        res.render('allblogs', {
            posts: posts
        })
    })
})








//POST route: Log in "checkpoint".  Compares the info entered in the login.pug file to the info found in the blog_ app db table "users"
app.post('/', (req, res) => {
    users.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (user.password == req.body.password) {
            console.log('session before', req.session)
            req.session.visited = true
            req.session.user = user
            res.redirect('/dashboard')
            console.log('session after', req.session)
        } else {
            res.render('incorrect login')
        }
    })
})







//Sends new user info received from the register.pug file to the blog_ app db table "users"
app.post('/register', (req, res) => {
   
    //Creates a var "newUser" with the user data form the input received in the register.pug file 
    let newUser = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    }
  
    //Actually creates the new user in the blog_ app db table "users"
    users.create(newUser)
    res.redirect('/')
})





//POST route to make the blog post.
// app.post('/createpost',(req, res) => {
//     if (req.session.visited == true) {
//         let newPost = {
//             title: rer.body.title,
//             body: req.body.body,
//             userId: req.session.user.Id,
//         }
//         posts.create(newPost)
//         res.redirect('/')
//         console.log("your post: " + newPost)
//     } else {
//         res.direct('/')
//         console.log("log in please")
//     }
//     })
// }

//server is running on port 3000//
var server = app.listen(8080, () => {
    sequelize.sync({force: true})
    console.log('Yo, this http://localhost is running:' + server.address().port);
});
