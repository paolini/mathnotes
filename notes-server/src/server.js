var express = require('express');
var app = express();
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
var rsaValidation = require('auth0-api-jwt-rsa-validation');
var request = require('superagent');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var flash = require('express-flash');

import bcrypt from 'bcrypt';
import {aws_getItem, aws_putItem} from './database';
import {aws_getItems, dump} from './database';


// app.use(express.static('public'));
// app.use(express.cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressSession({
  secret: 'mySecretKey4663775839233226573894',
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) =>
  aws_getItem("users", {"id": id}).then(
    user => done(null, user),
    err => done(err, null)));

const set_password = (user, new_password) => {
  user.password = bcrypt.hashSync(new_password, bcrypt.genSaltSync());
  return user;
};

/* test set_password */
/*
aws_getItem("users", {"id": "42"})
.then(user => aws_putItem("users", set_password(user, 'pippo123')))
.then(data => console.log("PWD RESET", data))
.catch(err => console.log("ERR", err));
*/

// passport/login.js
passport.use('local', new LocalStrategy(
  {passReqToCallback: true},
  (req, username, password, done) => {
    console.log("STRATEGY", username, password);
    aws_getItem('users', {'username': username})
    .then(user => {
      console.log("STRATEGY * ", username, password);
      if (!bcrypt.compareSync(password, user.password)) {
        console.log('invalid password for user', username);
        return done(null, false, req.flash('message', 'Invalid User or Password'));
      }
      // password matches!
      return done(null, user);
    })
    .catch(err => {
      console.log('user not found, username');
      return done(null, false, req.flash('message', 'Invalid User or Password'));
    })}));

/*
app.post('/login',
  passport.authenticate('local', { successRedirect: '/users',
                                   failureRedirect: '/error',
                                   failureFlash: true })
);
*/

app.post('/login', function(req, res, next) {
  console.log("REQ BODY", req.body);
  passport.authenticate('local', function(err, user, info) {
    console.log("PASSPORT", err, user, info);
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/' + user.username);
    });
  })(req, res, next);
});

// object that we’ll use to exchange our credentials for an access token.
const AUTH_DATA = {
  client_id: 'Dp2RNlr2SBQYJ0PcUIYSkqYLEqlHpxZA',
  client_secret: '1Riqc-_jF72Rm47jPY6Z-pyg9bclxNTHsdkP55n5sDkYJ0znrs2G3ggXBqfyCbpF',
  grant_type: 'client_credentials',
  audience: 'http://mathnotes.eu'
}

// a middleware to make a request to the oauth/token Auth0 API with our authData we created earlier.
// Our data will be validated and if everything is correct, we’ll get back an access token.
// We’ll store this token in the req.access_token variable and continue the request execution.
// It may be repetitive to call this endpoint each time and not very performant, so you can cache the access_token once it is received.
function getAccessToken(req, res, next){
  request
    .post('https://paolini.eu.auth0.com/oauth/token')
    .send(AUTH_DATA)
    .end(function(err, res) {
      if (err) console.log("** ERR", err);
      if(res.body.access_token){
        req.access_token = res.body.access_token;
        console.log("GOT TOKEN:", res.body.access_token);
        next();
      } else {
        res.send(401, 'Unauthorized');
      }
    })
}

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://paolini.eu.auth0.com/.well-known/jwks.json"
    }),
    audience: 'http://mathnotes.eu',
    issuer: "https://paolini.eu.auth0.com/",
    algorithms: ['RS256']
});



// app.use('/auth/login', getAccessToken);

// Enable the use of the jwtCheck middleware in /auth paths
// app.use('/auth', jwtCheck);

// If we do not get the correct credentials, we’ll return an appropriate message
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({message:'Missing or invalid token'});
  }
  console.log("err", err);
});

// Implement the movies API endpoint
app.get('/notes', function(req, res){
  aws_getItems('notes').then(data => res.json(data));
});

const filter_user = user => {
  const o = { ...user };
  delete o.password;
  return o;
};

app.get('/users', function(req, res) {
  aws_getItems('users').then(data => res.json(data.map(filter_user)));
});


// Launch our API Server and have it listen on port 8080.
const port = process.env.PORT || 8080;
console.log('listening on port', port);
app.listen(port);
