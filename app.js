
//CHECK: do i need pg?  do i need morgan?


//required packages for the app//
const express = require('express'),
    // morgan = require('morgan'), //middle ware for console.log's in the terminal (debugging)
    bodyParser = require('body-parser'),
    // methodOverride = require('method-override'),
    pug = require('pug'),
    sequelize = require('sequelize'),
    session = require('express-session')

const app = express()
//database parameters
const db = new sequelize('blog_app', 'stephendoherty', 'null', {
    host: 'localhost',
    dialect: 'postgres'
})



// var pg = require('pg'); 


//ConnetionString to database:
// var db = 'postgres://jon:mypassword@localhost/blog_app';
// const db = new Sequelize('postgres://jon:mypassword@localhost/blog_app');


//ConnetionString to db:
// var connectionString = 'postgres://jon:mypassword@localhost/bulletin_board_app';
// var connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/bulletin_board_app';


//database parameters
// const db = new sequelize('blog_app', 'stephendoherty', 'null', {
//     host: 'localhost',
//     dialect: 'postgres'
// })




// set the public folder
app.use(express.static('public'))

// tels the app to use sessions. The session will be max 1 hour
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}))



//create a table in de database Users
let users = db.define('users', {
    username: sequelize.STRING,
    password: sequelize.STRING,
    firstname: sequelize.STRING,
    lastname: sequelize.STRING,
    email: sequelize.STRING
})



//create a table in de database posts. Posts belong to users
let posts = db.define('posts', {
    title: sequelize.STRING,
    body: sequelize.TEXT
})




//create a table in de database comments. Comments belong to posts and users
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


//tels the app to use morgan//
// app.use(morgan('dev'));

//is for the input in the forms and parse it to JS//
app.use(bodyParser.urlencoded({
    extended: false
}))

//sets the view engine to pug. pug renders the html page//
app.set('view engine', 'pug')

//logout for user and redirect to rout
app.get('/logout', (req, res) =>{
  req.session.visited = false
  res.redirect('/')
  console.log(req.session)
})

//renders the pugfile allposts.pug on the root directory
app.get('/', (req, res) => {
    posts.findAll().then((posts) => {
        //console.log(posts)
        //render the allposts.pug file, in the views folder
        //posts object is passed as a parameter (key and value)
        res.render('allposts', {
            posts: posts
        })
    })
})

//gets the unique id to show one post
app.get('/onepost/:id', (req, res) => {
    //find the full row of data in 'posts' table from the id
    posts.findOne({
      where: {
          id: req.params.id
      },
      include: [
        {model: comments},
        //{model: users}
      ]
      }).then(post => {
        //renders the onepost.pug file
        //console.log(post)
        res.render('onepost', {
            post: post
        })
    })
})


//leave a comment at a post
app.post('/onepost/*', (req, res)=>{
  if (req.session.visited == true) {

      let newComment = {
          body: req.body.body,
          userId: req.session.user.id,
          postId: req.body.postId
      }
      comments.create(newComment)
      //res.redirect('/onepost/:id')
      console.log("your comment: " + newComment)
  } else {
      res.redirect('/')
      console.log("log in please")
  }
})


//renders the register pug file on url /register//
app.get('/register', (req, res) => {
    res.render('register')
})

//renders the login pug file on url /register//
app.get('/login', (req, res) => {
  if (req.session.visited == true) {
    res.redirect('/dashboard')
  } else {
    res.render('login')
  }
})

//renders the register pug file on url /register//
app.get('/createpost', (req, res) => {
    res.render('createpost')
})

//renders the dasgboard pug file on url /dashboard//
app.get('/dashboard', (req, res) => {
    // is user is logedin it will render the page.
    if (req.session.visited == true) {
      //findes all posts of the logedin user
        posts.findAll({
                where: {
                    userId: req.session.user.id
                }
            })
            .then(posts => {
                //renders all posts of the user and will render the logedin user data
                console.log(posts)
                res.render('dashboard', {
                    posts: posts,
                    results: req.session.user
                })
            })
        console.log("good job by " + req.session.user.username)
    //if user is not logedin then it will redirect to rout page
    } else {
        res.redirect('/')
        console.log("log in please")
    }
})

//POST route: Log in "checkpoint".  Compares the info entered in the login.pug file to the info found in the blog_ app db table "users"
app.post('/', (req, res) => {
    //console.log(req.body)
    //console.log('username: ' + username + ' password: ' + password)
    users.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (user.password == req.body.password) {
            //console.log ('loged in: ' + req.body.username)
            console.log('session before', req.session)
            //sets the session visited to true after login
            req.session.visited = true
            //stores the users data in the session after login. Data can be uses in dashboard
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
    //console.log(req.body)
    //Creates a var "newUser" with the user data form the input received in the register.pug file 
    let newUser = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    }
    //console.log(newUser)
    //Actually creates the new user in the blog_ app db table "users"
    users.create(newUser)
    res.redirect('/')
})

//function to make posts
app.post('/createpost', (req, res) => {
    if (req.session.visited == true) {

        let newPost = {
            title: req.body.title,
            body: req.body.body,
            userId: req.session.user.id
        }
        posts.create(newPost)
        res.redirect('/')
        console.log("your post: " + newPost)
    } else {
        res.redirect('/')
        console.log("log in please")
    }
})

//server is running on port 3000//
db.sync().then(() => {

}).catch(console.log.bind(console))
app.listen(3000, function() {
})
