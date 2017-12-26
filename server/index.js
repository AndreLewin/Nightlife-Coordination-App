const express = require('express');
const app = express();
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');

const Go = require('./model/Go');


// Get process.env.VARIABLES from .env
require('dotenv').load();

// Make the content of ./public accessible from URL
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// Use and configure body-parser for reading the body of HTTP requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use the webpack dev server as a middleware, so we can launch it from this file
const config = require('../webpack.dev.config');
const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: {colors: true}
}));

// Configure Mongoose
mongoose.connect(process.env.DB_URI, { useMongoClient: true });
mongoose.Promise = global.Promise;


// Send a request to the YELP API
app.get('/search', async (req, res) => {

  const city = req.query.city;
  const yelp_API_key = process.env.YELP_API_KEY;

  const response = await axios.get('https://api.yelp.com/v3/businesses/search?location='+city+'?term=bar', { headers: { Authorization: "Bearer "+yelp_API_key } });
  const rawBusinesses = response.data.businesses;

  // Get the data of who goes where from the database
  const gos = await Go.find().lean();

  console.log("let's authenticate");
  const user_id = await authenticate(req.headers.authorization) || "not logged in";

  // For each business define .numberGoing and .isGoing based on the data retrieved
  const businesses = rawBusinesses.map((business) => {

    business.isGoing = gos.some(go => go.bar_id === business.id && go.user_id === user_id);
    business.othersGoing = gos.filter(go => go.bar_id === business.id).length - (business.isGoing ? 1 : 0);

    return business;
  });

  res.status(200).send(businesses);
});


// Make a reservation
app.post('/bars/:bar_id/go', async (req, res) => {

  const bar_id = req.params.bar_id;
  const user_id = await authenticate(req.headers.authorization) || "not logged in";

  if (user_id === "not logged in"){
    res.status(401).send("Unauthorized: Only logged users can go to a bar.")
  } else {
    // Check if the user already goes to a bar X
    // A user can only go to one bar, so all other gos are deleted
    // If the user is not already going to the bar, make it go
    const alreadyGo = await Go.findOne({ user_id: user_id, bar_id: bar_id });
    const allGoFromUser = await Go.find({ user_id: user_id });
    allGoFromUser.map(go => go.remove());
    if (!alreadyGo) {
      const newGo = new Go({user_id: user_id, bar_id: bar_id});
      newGo.save();
    }

    res.status(200).send({isGoing: !alreadyGo});
  }
});


// Get the user_id from the accessToken using the Authentication API of Auth0
// Return false is the user could not be authenticated
const authenticate = async (accessToken) => {

  if (accessToken === "null") {
    return false;
  }

  const endpoint = process.env.AUTH0_APP_ENDPOINT;
  const response = await axios.get(endpoint, { headers: { Authorization: "Bearer "+accessToken } }).catch(error => false);

  if (response === false) {
    return false;
  }
  console.log("response: " + response);
  const user_id = response.data.sub.split('|')[1];
  console.log("user_id: " + user_id);
  return user_id;
};


// listen for requests
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
