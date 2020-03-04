'use strict'

module.exports = db => Promise.all([
  db.recordTypes.Movie.load('movies.csv', 'movies.imdb.json'),
  db.recordTypes.Recipe.load('recipe')
])
