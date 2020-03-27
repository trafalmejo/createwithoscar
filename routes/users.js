const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const passport = require('passport')

//Bring user model
let User = require('../models/user')

// Register Form
router.get('/register', function(req, res){
    res.render('register');
})
router.post('/register', [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Email is not valid').isEmail(),
    check('username', 'Username is required').notEmpty(),
    check('password', 'Password is required').notEmpty()
    // check('password2').isEmpty().custom((value,{req, loc, path}) => {
    //     if (value !== req.body.password2) {
    //         // trow error if passwords do not match
    //         throw new Error("Passwords don't match");
    //     } else {
    //         return value;
    //     }
    // })
],
function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('register',{
            errors: errors.array()
        });
    }else{
        let newUser = new User({
            name:name,
            email:email,
            username:username,
            password:password
        })
        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password, salt, function(err, hash){
                if(err){
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function(err){
                    if(err){
                        console.log(err);
                        return;
                    }else{
                        req.flash('success', 'You are now registered and can login');
                        res.redirect('/user/login');
                    }
                })
            });

        })
    }

})
//login form
router.get('/login', function(req, res){
    res.render('login');
})

//logln process
router.post('/login', function(req, res, next){
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
})

//logout process
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You are logged out')
    res.redirect('/user/login')
})

module.exports = router;