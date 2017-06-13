
//CHECK: do i need pg? 


//required packages for the app//
const express = require('express'),
    bodyParser = require('body-parser'),
    pug = require('pug'),
    sequelize = require('sequelize'),
    session = require('express-session')

const app = express()

// var pg = require('pg'); 

//This is my DB connection.
const db = new sequelize('blog_app', 'stephendoherty', 'null', {
    host: 'localhost',
    dialect: 'postgres'
})

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


//Setting up sessions.
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}))



//Creates a table in the Postgresql db called "users".
let users = db.define('users', {
    username: sequelize.STRING,
    password: sequelize.STRING,
    firstname: sequelize.STRING,
    lastname: sequelize.STRING,
    email: sequelize.STRING
})



//Will create a table in Postgresql db called "posts". Posts get ID's.
let posts = db.define('posts', {
    title: sequelize.STRING,
    body: sequelize.TEXT
})




//Will create a table in Postgresql db called "comments". Comments are tied to posts.  Posts are tied to users.
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





//Parse the input in the forms and into JS
app.use(bodyParser.urlencoded({
    extended: false
}))



//Sets the view engine to pug.
app.set('view engine', 'pug')



//Set up the user logout.
app.get('/logout', (req, res) =>{
  req.session.visited = false
  res.redirect('/')
  console.log(req.session)
})




//Renders the pugfile allposts.pug on the root directory.
app.get('/', (req, res) => {
    posts.findAll().then((posts) => {
        res.render('allposts', {
            posts: posts
        })
    })
})


//Unique id to show a post.
app.get('/onepost/:id', (req, res) => {
    posts.findOne({
      where: {
          id: req.params.id
      },
      include: [
        {model: comments},
      ]
      }).then(post => {
        res.render('onepost', {
            post: post
        })
    })
})


//Enables users to leave a comment on another users (or their own) post.
app.post('/onepost/*', (req, res)=>{
  if (req.session.visited == true) {
      let newComment = {
          body: req.body.body,
          userId: req.session.user.id,
          postId: req.body.postId
      }
      comments.create(newComment)
      console.log("You left this comment: " + newComment)
      res.redirect('/')
  } else {
      res.redirect('/')
      console.log("Logging in is required!")
  }
})


//Renders the register pug file.
app.get('/register', (req, res) => {
    res.render('register')
})



//Renders the login pug file.
app.get('/login', (req, res) => {
  if (req.session.visited == true) {
    res.redirect('/dashboard')
  } else {
    res.render('login')
  }
})



//Renders the register pug file. (users create an account)
app.get('/createpost', (req, res) => {
    res.render('createpost')
})



//Renders the logged in users dashboard pug file.
app.get('/dashboard', (req, res) => {
    // Page will render IF the user is logged in.
    if (req.session.visited == true) {
      //Finds all posts by user. (IF the user is logged in.)
        posts.findAll({
                where: {
                    userId: req.session.user.id
                }
            })
            .then(posts => {
                //Renders user information and all posts by user. (IF the user is logged in.)
                console.log(posts)
                res.render('dashboard', {
                    posts: posts,
                    results: req.session.user
                })
            })
        console.log("Log in now" + req.session.user.username)
    //Redirects user if not logged in.
    } else {
        res.redirect('/')
        console.log("Log in now")
    }
})




//POST route: Log in "checkpoint". Compares the info entered in the login.pug file to the info found in the blog_ app db table "users".
app.post('/', (req, res) => {
    users.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (user.password == req.body.password) {
            console.log('session before', req.session)
            req.session.visited = true
            //Logged in User data get stored in the session.
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

    //User data entered into the input form "register.pug" is stored in var "newUser".
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




//POST route: Users make new posts. (logged in)
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

//Sever connection to port 3k.
db.sync().then(() => {
}).catch(console.log.bind(console))
app.listen(3000, function() {
})




//Sever connection to port 3k.
// db.sync().then(() => {
// }).catch(console.log.bind(console))
// app.listen(3000, function() {
// })


