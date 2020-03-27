const express = require('express');
const router = express.Router();
let Article = require('../models/article')
let User = require('../models/user')
const { check, validationResult } = require('express-validator');


//Add Articles
router.get('/add', ensureAuthenticated, function(req, res){
    //res.send('Hello World');
    res.render('add_article', {
        title: "Add Article"
    })
})
//Add submit POST Route
router.post('/add',[
    check('title', 'Title is empty').notEmpty(),
    //check('author', 'Author is empty').notEmpty(),
    check('body', 'Body is empty').notEmpty()
], function(req, res){
    console.log("Submitted")
    //req.check('title').notEmpty()
    //req.checkBody('author', 'Author is required').notEmpty();
    //req.checkBody('body', 'Body is required').notEmpty();
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('add_article', {
            title: 'Add Article',
            errors: errors.array()
        });
    }else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
    
        article.save(function(err){
            if(err){
                console.log(err)
            return;
        }
            else{
                req.flash('success', 'Article Added')
                res.redirect('/')
            }
        })
    }
})


router.get('/:id', function(req, res){
    Article.findById(req.params.id, function(err, article)
    {
        User.findById(article.author, function(err, user){
            res.render('article', {
                article: article,
                author: user.name
            })
        })
    })
})

//Load edit form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
    Article.findById(req.params.id, function(err, article)
    {
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorized')
            res.redirect('/')
        }
        res.render('edit_article', {
            title: "Edit Article",
            article: article
        })
    })
})
//Add submit POST Route
router.post('/edit/:id', function(req, res){
    let article = {}
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, article, function(err){
        if(err){
            console.log(err)
        return;
    }
        else{
    req.flash('success', 'Article Edited')
    res.redirect('/')

        }
    })
})

router.delete('/:id', function(req,res){
    if(!req.user._id){
        res.status(500).send();
    }
    let query = {_id:req.params.id}

    Article.findById(req.params.id, function(err, article){
        if(article.author != ReadableStream.user._id){
            res.status(500).send()
        }
        else{
            res.send('Success')
        }
    })
    Article.remove(query, function(err){
        if(err){
            console.log(err)
        }
        else{

        }
        req.flash('danger', 'Article deleted')
        res.send('success');

    })
})


//Access Control
function ensureAuthenticated(req, res, next)
{
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('danger', 'Please Login')
        res.redirect('/user/login')
    }
}
module.exports = router;