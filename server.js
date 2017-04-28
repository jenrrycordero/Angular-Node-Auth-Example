var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var http = require('http');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');

var config = require('./config'); // get our config file
var User = require('./models/user'); // get our mongoose model


//==================================================================

passport.use(new LocalStrategy(function (username, password, cb) {
    // find the user
    User.findOne({username: username}, function(err, user){
        if (err) return cb(err);
        if (!user) {
            return cb(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validPassword(password)) {
            return cb(null, false, { message: 'Incorrect password.' });
        }
        return cb(null, user);
    });
}));

// Allow Cross Domain request
//==================================================================
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Authorization,Origin,X-Requested-With,Content-Type,Cache-Control,Accept");
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    } else {
        return next();
    }
});

// Set all environments
app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization

// development only
// console.log(process.env);
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

mongoose.connect(config.database); // connect to database

//==================================================================

//==================================================================
// Define a middleware function to be used for every secured routes
var auth = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers.authorization;

    // Check token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                // if everything is good, next middleware
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
};

//==================================================================

//==================================================================
// route to test if the user is logged in or not
app.post('/loggedin', auth, function (req, res) {
    res.send({success: 'Token Success'})
});

// Register to receive a token
app.post('/register', function (req, res) {

    var user = new User({
        fullname: req.body.fullname,
        username: req.body.username,
        password: req.body.password,
        address:{
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        },
        phone: req.body.phone,
        driver_license: req.body.driver_license,
        license_exp_month: req.body.license_exp_month,
        license_exp_year: req.body.license_exp_year,
        avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
        email_token: jwt.sign({id: req.body.username}, config.secret),
        role: 'driver',
        is_active: false
    });

    // save user
    user.save(function(err, user) {
        if (err){
            console.log(err);
            if(err.code == 11000)
                res.json({ success: false, message: 'Values need to be unique' });
            else
                throw err
        }

        if(user){
            // console.log(user);
            res.json({ success: true, message: 'User registered successfully' });

            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: config.email,
                    pass: config.emailPass
                }
            });

            var mailData = {
                from: 'dujarric.design@gmail.com',
                to: user.username,
                subject: 'Welcome to test',
                html: '<b>Welcome to our amazing platform <a href="http://auth2/#/login?auth=' + user.email_token + '">Click here to Login</a></b>'
            };

            transporter.sendMail(mailData, function(err){
                if(err)console.log(err);
            });
        }

    });

});

// First login to receive a token
app.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({status: 'error', code: 'unauthorized'});
        }
        else if(!user.is_active){
            return res.status(401).json({status: 'error', code: 'unauthorized'});
        }else {
            return res.json({token: jwt.sign({id: user.id}, config.secret), welcomeName: user.fullname, welcomeAvatar: user.avatar});
        }
    })(req, res, next);
});

// Verify registration from email
app.post('/verify', function (req, res) {

    var verification_token = req.body.auth;

    User.update({email_token : verification_token}, { $set: { is_active: true }}, function (err, users) {
        if (err) return console.error(err);

        if(users)
            res.send({status: true, users: users});
    });
});


//==================================================================

//==================================================================
// Secured routes using the Auth Method - Middleware

// Get All Users
app.get('/users', auth, function (req, res) {
    User.find({}, '_id fullname username phone driver_license', function (err, users) {
        if (err) return console.error(err);
        if(users)
            res.send({status: true, users: users});
    });
});

// Get Single User
app.post('/user', auth, function (req, res) {
    User.findById({'_id': req.body.userId}, 'fullname username password phone driver_license license_exp_month role license_exp_year avatar', function (err, user) {
        if (err) return console.error(err);
        if(user)
            res.send({status: true, user: user});
    });
});

// Get Single User
app.post('/userUpdate', auth, function (req, res) {

    User.findById(req.body.user._id, function (err, user) {
        if (err) return handleError(err);

            user.fullname = req.body.user.fullname;
            user.username =  req.body.user.username;
            user.password = req.body.user.password;
            user.phone =  req.body.user.phone;
            user.driver_license = req.body.user.driver_license;
            user.license_exp_month = req.body.user.license_exp_month;
            user.license_exp_year =  req.body.user.license_exp_year;
            user.avatar = 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50';
            user.role = req.body.user.role;

        user.save(function (err, updatedUser) {
            if (err) return handleError(err);
            if(updatedUser)
                res.json({ status: true, message: 'User Updated successfully' });
        });
    });
});

// Create New User
app.post('/userCreate', auth, function (req, res) {

    var user = new User({
        fullname: req.body.user.fullname,
        username: req.body.user.username,
        password: req.body.user.password,
        address:{
            address1: req.body.user.address1,
            address2: req.body.user.address2,
            city: req.body.user.city,
            state: req.body.user.state,
            zip: req.body.user.zip
        },
        phone: req.body.user.phone,
        driver_license: req.body.user.driver_license,
        license_exp_month: req.body.user.license_exp_month,
        license_exp_year: req.body.user.license_exp_year,
        avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
        email_token: jwt.sign({id: req.body.user.username}, config.secret),
        role: req.body.user.role,
        is_active: true
    });

    // save user
    user.save(function(err, user) {
        if (err){
            console.log(err);
            if(err.code == 11000)
                res.json({ success: false, message: 'Values need to be unique' });
            else
                throw err
        }
        if(user){
            res.json({ status: true, message: 'User registered successfully' });

        }
    });

});


//==================================================================

//==================================================================
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
