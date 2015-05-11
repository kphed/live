var express = require('express');
var bodyParser = require('body-parser');
var sequelize = require('sequelize');
var db = require('./config');
var http = require('http');
var hstore = require('pg-hstore')();
var methodOverride = require('method-override');
// var Artists = require('./models/artists');
// var Reviews = require('./models/reviews');

var app = express();

app.set('views', '../client/www');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/../client/www'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());

var port = process.env.PORT || 5000;

db.sequelize.sync().then(function() {
  http.createServer(app).listen(port, function(){
    console.log('Express server listening on port ' + port);
  });
});

app.get('/art', function(req, res){
  db.Artist.findAll({})
  .then(function (artists) {
    res.status(200).json(artists);
  })
  .catch(function(error) {
    console.log('error: ', error);
  });
});

app.get('/artist', function(req, res){
  db.Artist.find({
    where: { artistName: req.query.artistName }
  })
  .then(function (artist) {
    res.status(200).json(artist);
  });
});

app.get('/getreviews', function(req, res){
  db.Review.findAndCountAll({
    where: { artistName: req.query.artistName }
  })
  .then(function (review) {
    res.status(200).json(review);
  });
});

var query = ' \
  SELECT AVG(rating) FROM "Reviews" \
  WHERE "artistName" = :artistName \
';

app.get('/getAvgRating', function(req, res){
  db.sequelize.query("SELECT AVG(rating) FROM `Reviews` WHERE artistName = :artistName ", {replacements: [req.query.artistName], type: sequelize.QueryTypes.SELECT})
  // db.sequelize.query(query, null, {raw: true}, { 
  // artistName: req.query.artistName 
})
  .then(function(avgRating) {
    console.log('average rating: ', avgRating[0]);
    res.status(200).json(avgRating[0]);
  });
});

app.post('/newartist', function(req, res) {
  db.Artist
    .build( req.body )
    .save()
    .then(function(body) {
      res.status(201).send(body);
    })
    .catch(function(error) {
      console.log('error: ', error);
    });
});

app.post('/newreview', function(req, res) {
  db.Review
    .build( req.body )
    .save()
    .then(function(body) {
      res.status(201).send(body);
    }).catch(function(error) {
      console.log('error: ', error);
    });
});

app.post('/updateAvgRating', function(req, res) {
  db.Artist
    .update( {
      avgRating: req.body.avgRating,
      reviewCount: sequelize.literal('reviewCount + 1')
    },
    { where: 
      { artistName: req.query.artistName }
    })
    .then(function(body) {
      res.status(201).send(body);
    })
    .catch(function(error) {
      console.log('error: ', error);
    })
})


