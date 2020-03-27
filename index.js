const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session')
const config = require('./config/database');
const passport = require('passport')


mongoose.connect(config.database);
let db = mongoose.connection;



//check connection
db.once('open', function(){
    console.log('connected to mongodb')
})
//check for db errors
db.on('error', function(err){
    console.log(err)
})

//Init App
const app = express();

//Bring Models
let Article = require('./models/article')
let User = require('./models/user')

//Load View Engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

//set public folder
app.use(express.static(path.join(__dirname, 'public')))


//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
  }))
  //express messages middleware 
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

app.get('/', function(req, res){
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        }else{
            res.render('index', {
                title: "Hello",
                articles: articles
            })
        }
    })
})
// Router files
let articles = require('./routes/articles');
app.use('/article', articles)
// Router files
let users = require('./routes/users');
app.use('/user', users)

//Start Server
app.listen(3000, function(){
    console.log('Server running.....')
})