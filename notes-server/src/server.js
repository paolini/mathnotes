var express = require('express');
var app = express();
var jwt = require('express-jwt');
var rsaValidation = require('auth0-api-jwt-rsa-validation');

import {aws_getItems, dump} from './database';

// Implement the movies API endpoint
app.get('/notes', function(req, res){
  // load data from database
  const notes = aws_getItems('notes').then(data => res.json(data));
});

// Launch our API Server and have it listen on port 8080.
app.listen(8080);
