require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

// console.log("server.js API_TOKEN= ", process.env.API_TOKEN)

// use data structures instead of a database
const MOVIES = require('./movies.json');

// define our express application object
const app = express();

// start of pipeline: all requests go through these
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));

app.use(cors());   // allow cross-origin resource sharing
app.use(helmet()); // be careful with your response headers

// all requests go through token validation
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next(); // go to the next handler (may be endpoint-specific)
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response);
}) 

function handleGetMovie(req, res) {
  const { genre, country, vote } = req.query;
  if (!genre && !country && !vote) {
    res.json(MOVIES);
  }
  let movies = MOVIES;

  if(genre) {
    movies = movies.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()));
  }
  if(country){
    movies = movies.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase()));
  }
  if(vote){
    movies = movies.filter(movie => movie.avg_vote >= vote);
  }


  res.json(movies);
}
app.get('/movie', handleGetMovie);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});