'use strict'

const tags = {
  tr: 0,
  td: 0,
  a: 0,
  button: 0,
  div: 0
}

const NOT_IMDB = 'n/a'

function cache (key, value) {
  if (value === undefined) {
    return JSON.parse(localStorage.getItem(key))
  }
  localStorage.setItem(key, JSON.stringify(value))
}

Object.keys(tags).forEach(tag => {
  tags[tag] = gpf.web.createTagFunction(tag)
})

function row (index) {
  return document.getElementById(`row-${index}`)
}

function btn (index) {
  return document.getElementById(`btn-${index}`)
}

function mnu (index) {
  return document.getElementById(`mnu-${index}`)
}

function select (movies, index, imdbId) {
  movies[index].imdb = imdbId
  const button = btn(index)
  button.innerHTML = imdbId
  button.classList.remove('btn-primary')
  button.classList.add('btn-success')
  cache(`select-${index}`, imdbId)
}

function search (movie, index, movies) {
  const title = movie.title.toLowerCase().replace(/:|%/g, ' ')
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
    .then(suggestions => suggestions.filter(suggestion => suggestion.q && suggestion.q !== 'video game'))
    .then(suggestions => {
      if (!suggestions || !suggestions.length) {
        return
      }
      suggestions
        .sort((s1, s2) => s2.y - s1.y)
        .forEach(suggestion => tags.a({
          className: 'dropdown-item',
          'data-index': index,
          'data-imdb': suggestion.id,
          href: `https://www.imdb.com/title/${suggestion.id}`,
          target: 'imdb'
        }, `${suggestion.id}: ${suggestion.l} [${suggestion.y}]`).appendTo(mnu(index)))
      if (!movie.imdb) {
        if (suggestions.length === 1) {
          return select(movies, index, suggestions[0].id)
        }
        const exactTitles = suggestions.filter(suggestion => suggestion.l.toLowerCase() === title)
        if (exactTitles.length === 1) {
          return select(movies, index, exactTitles[0].id)
        }
      }
    })
    .catch(() => {})
}

function extract (imdbId) {
  const infos = {}
  gpf.http.get(`/imdb-title/${imdbId}`)
    .then(response => response.responseText)
    .then(titleHtml => {
      // <a href="/year/1979/?ref_=tt_ov_inf">1979</a>
      infos.year = /<a href="\/year\/([0-9]+)\//.exec(titleHtml)[1]
      // <a href="/search/title?genres=horror&amp;explore=title_type,genres&amp;ref_=tt_ov_inf">Horror</a>
      const genres = []
      titleHtml.replace(/<a href="\/search\/title\?genres=([^&]+)&/g, (match, genre) => {
        if (!genres.includes(genre)) {
          genres.push(genre)
        }
      })
      infos.genres = genres
      // <a href="/name/nm0000244/?ref_=tt_ov_st_sm">Sigourney Weaver</a>
      const cast = []
      titleHtml
        .split('<table class="cast_list">')[1]
        .split('</table>')[0]
        .replace(/\n/g, '')
        .replace(/<a href="\/name\/[^"]+"\s*>\s*([^<]+)<\/a>(?:[^<]|<[^a])*<a href="\/title\/[^"]+"\s*>([^<]+)<\/a>/gm, (match, actor, role) => {
            cast.push(`${actor}=${role}`)
        })
      infos.cast = cast
      return gpf.http.get(`/imdb-releaseinfo/${imdbId}`)
    })
    .then(response => response.responseText.replace(/\n/g, ''))
    .then(releaseInfoHtml => {
        releaseInfoHtml.replace(/<td class="aka-item__name">([^<]*)<\/td>\s*<td class="aka-item__title">([^<]*)<\/td>/gm, (match, country, title) => {
          if (country.toLowerCase() === 'france') {
              infos.frenchTitle = title
          } else if (country.toLowerCase().trim() === '(original title)') {
              infos.originalTitle = title
          }
        })
    })
    .then(() => {
      alert(`Year: ${infos.year}
Genres: ${infos.genres.join(', ')}
Cast: ${infos.cast.join('; ')}
Original title: ${infos.originalTitle}
French title: ${infos.frenchTitle}`)
    })
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
        movie.imdb = cache(`select-${index}`)
        tags.tr({ id: `row-${index}` },
          tags.td(movie.title),
          tags.td([
            tags.button({
              id: `btn-${index}`,
              className: `btn dropdown-toggle btn-${movie.imdb ? 'success' : 'primary'}`,
              'data-imdb': movie.imdb,
              'data-toggle': 'dropdown',
              'aria-haspopup': true,
              'aria-expanded': false
            }, movie.imdb ? movie.imdb : 'Search'),
            tags.div({
              id: `mnu-${index}`,
              className: 'dropdown-menu',
              'aria-labelledby': `btn-${index}`
            }, [
              tags.a({
                className: 'dropdown-item',
                href: '#',
                'data-index': index,
                'data-action': 'view'
              }, 'View IMDB page'),
              tags.a({
                className: 'dropdown-item',
                href: '#',
                'data-index': index,
                'data-action': 'extract'
              }, 'Extract IMDB infos'),
              tags.a({
                className: 'dropdown-item',
                href: '#',
                'data-index': index,
                'data-action': 'manual'
              }, 'Manual input'),
              tags.a({
                className: 'dropdown-item',
                href: '#',
                'data-index': index,
                'data-imdb': NOT_IMDB,
              }, 'Not an imbd movie'),
              tags.div({className: 'dropdown-divider'})
            ])
          ])
        ).appendTo(tbody)
      }
    })
    tbody.addEventListener('click', event => {
      const target = event.target
      const targetName = (target.tagName || '').toLowerCase()
      if (targetName === 'a') {
        if (target.dataset.imdb) {
          select(movies, target.dataset.index, target.dataset.imdb)
        }
        if (target.dataset.action === 'manual') {
          const input = prompt('Enter IMDB id (tt0123456)')
          if (input) {
            select(movies, target.dataset.index, input)
          }
        }
        if (target.dataset.action === 'view') {
          window.open(`https://www.imdb.com/title/${movies[target.dataset.index].imdb}`, 'imdb')
        }
        if (target.dataset.action === 'extract') {
          extract(movies[target.dataset.index].imdb)
        }
        event.preventDefault()
      }
      return false
    })
    gpf.forEachAsync(movies, search)
    document.getElementById('export').addEventListener('click', () => {
      const select = movies.reduce((dictionary, movie, index) => {
        const imdb = cache(`select-${index}`)
        if (imdb) {
          dictionary[index] = imdb
        }
        return dictionary
      }, {})
      const content = window.open('about:blank')
      content.document.write(JSON.stringify({select}))
      // prompt('Copy the export', )
    })
    document.getElementById('import').addEventListener('click', () => {
      const data = JSON.parse(prompt('Paste to import'))
      Object.keys(data.select).forEach(index => {
        cache(`select-${index}`, data.select[index])
      })
      location.reload()
    })
  })
