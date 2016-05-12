var express = require('express');
var logger = require('morgan');
var path = require('path');
var zipdb = require('zippity-do-dah');
var ForecastIO = require('forecastio');

var forecast_express = express();

// set the our own ForecastIO API key here
var weather_api = new ForecastIO('a2acf1c65003ba74f92e063db17fa154');

// use morgan middleware for logger
forecast_express.use(logger('dev'));

// set the path using __dirname
forecast_express.use(express.static(path.resolve(__dirname, 'public')));

// set the EJS engine for viewer
forecast_express.set("views", path.resolve("views"));
forecast_express.set("view engine", "ejs");

// render the index.ejs at the homepage
forecast_express.get('/', function(req, res){
  res.render('index');
});

// captures the specified zipcode and passes it as params
forecast_express.get(/^\/(\d{5})$/, function(req, res, next){
  var zipcode = req.params[0];
  var location = zipdb.zipcode(zipcode);

  if(!location.zipcode){
    next();
    return;
  }

  var latitude = location.latitude;
  var longitude = location.longitude;

  weather_api.forecast(latitude, longitude, function(err, data){
    if(err){
      next();
      return;
    }

    // send the data as the JSON
    res.json({
      zipcode: zipcode,
      temperature: data.currently.temperature
    });
  });
});

// if the page not found, it will return to 404
forecast_express.use(function(req, res){
  res.status(404).render('404');
});

forecast_express.listen(3000, function(){
  console.log('Forecast site is running on port 3000');
});
