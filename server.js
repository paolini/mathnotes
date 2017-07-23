var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Note = require('./api/models/noteModel');
  bodyParser = require('body-parser');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/mathnotes');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
cons = require('consolidate')
app.set('view engine', 'html');
app.engine('html', cons.mustache);

var routes = require('./api/routes/noteRoutes');
routes(app);

app.get('/', function (req, res) {
  res.render('index.html');
});

app.listen(port);

console.log('mathnotes RESTful API server started on: ' + port);
