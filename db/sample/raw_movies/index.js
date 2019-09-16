'use strict'

const tags = {
  tr: 0,
  td: 0,
  a: 0,
  button: 0,
  div: 0
}

const VIEW = 'View'

Object.keys(tags).forEach(tag => {
  tags[tag] = gpf.web.createTagFunction(tag)
})

function getRow (index) {
  return document.getElementById(`row-${index}`)
}

function getButton (index) {
  return document.getElementById(`btn-${index}`)
}

function resolve (movies, index, imdbId) {
  movies[index].imdb = imdbId
  getButton(index).innerHTML = VIEW
}

function search (movies, index, row) {
  const title = movies[index].title.toLowerCase().replace(/:|%/g, ' ')
  if (!title) {
    return false
  }
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
        return resolve(movies, index, suggestions[0].id)
      }
      const exactTitles = suggestions.filter(suggestion => suggestion.l.toLowerCase() === title)
      if (exactTitles.length === 1) {
        return resolve(movies, index, exactTitles[0].id)
      }
      const imdbCell = row.querySelectorAll('td')[1]
      const button = imdbCell.querySelector('button')
      tags.div({className: 'dropdown-menu', 'aria-labelledby':`btn-${index}`},
        suggestions.map(suggestion => tags.a({
          className: 'dropdown-item',
          href: `https://www.imdb.com/title/${suggestion.id}`,
          target: 'imdb'
        }, suggestion.l))
          .concat([
            tags.div({className: 'dropdown-divider'}),
            tags.a({className: 'dropdown-item', href: '#'}, 'resolve'),
            tags.a({className: 'dropdown-item', href: '#'}, 'not an imbd movie'),
          ])
      ).appendTo(imdbCell)
      button.classList.add('dropdown-toggle')
      button.setAttribute('data-toggle', 'dropdown')
      button.setAttribute('aria-haspopup', 'true')
      button.setAttribute('aria-expanded', 'false')
      return false
    })
    .catch(() => {})
}

function click (movies, row) {
  const index = parseInt(row.id, 10)
  const imdbId = movies[index].imdb
  if (imdbId) {
    window.open('https://www.imdb.com/title/' + imdbId, 'imdb')
  } else {
    search(movies, index, row)
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
        tags.tr({ id: `row-${index}` },
          tags.td(movie.title),
          tags.td(tags.button({
            id: `btn-${index}`,
            className: 'btn btn-primary'
          }, movie.imdb ? VIEW : 'Search'))
        ).appendTo(tbody)
      }
    })
    tbody.addEventListener('click', event => {
      if (event.target.tagName.toLowerCase() === 'button') {
        click(movies, event.target.closest('tr'))
      }
    })
    gpf.forEachAsync(movies, (movie, index) => search(movies, index, getRow(index)))
  })
