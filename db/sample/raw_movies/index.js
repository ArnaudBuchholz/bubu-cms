'use strict'

const tags = {
  tr: 0,
  td: 0,
  a: 0,
  button: 0
}

const VIEW = 'View'

Object.keys(tags).forEach(tag => {
  tags[tag] = gpf.web.createTagFunction(tag)
})

function resolve (movies, index, imdbId) {
  movies[index].imdb = imdbId
  document.getElementById(index).querySelector('button').innerHTML = VIEW
}

function search (movies, index) {
  const title = movies[index].title.toLowerCase()
  return gpf.http.get(`/imdb-query/${title.toLowerCase()}`)
    .then(response => {
      const text = response.responseText
      const len = text.length
      const pos = text.indexOf('{')
      return text.substring(pos, len - 1)
    })
    .then(responseText => JSON.parse(responseText))
    .then(responseJSON => responseJSON.d)
    .then(suggestions => {
      if (!suggestions) {
        return false
      }
      if (suggestions.length === 1) {
        resolve(movies, index, suggestions[0].id)
        return true
      }
      const exactTitles = suggestions.filter(suggestion => suggestion.l.toLowerCase() === title)
      if (exactTitles.length === 1) {
        resolve(movies, index, exactTitles[0].id)
      }
      return false
    })
}

function click (movies, row) {
  const index = parseInt(row.id, 10)
  const imdbId = movies[index].imdb
  if (imdbId) {
    window.open('https://www.imdb.com/title/' + imdbId, 'imdb')
  } else {
    search(movies, index)
  }
}

gpf.http.get('raw_movies.csv')
  .then(response => response.responseText)
  .then(csv => {
    const input = new gpf.stream.ReadableString(csv)
    const lineAdapter = new gpf.stream.LineAdapter()
    const csvParser = new gpf.stream.csv.Parser()
    const output = new gpf.stream.WritableArray()
    return gpf.stream.pipe(input, lineAdapter, csvParser, output)
      .then(() => output.toArray())
  })
  .then(movies => {
    const tbody = document.getElementById('movies')
    movies.forEach((movie, index) => {
      if (movie.title) {
        tags.tr({ id: index },
          tags.td(movie.title),
          tags.td(tags.button({
            className: "btn btn-primary"
          }, movie.imdb ? VIEW : 'Search'))
        ).appendTo(tbody)
      }
    })
    tbody.addEventListener('click', event => {
      if (event.target.tagName.toLowerCase() === 'button') {
        click(movies, event.target.closest('tr'))
      }
    })
    gpf.forEachAsync(movies, (movie, index) => search(movies, index))
  })
