'use strict'

const tags = {
  tr: 0,
  td: 0
}

Object.keys(tags).forEach(tag => {
  tags[tag] = gpf.web.createTagFunction(tag)
})

gpf.http.get('raw_movies.csv')
  .then(response => response.responseText)
  .then(csv => {
    const input = new gpf.stream.ReadableString(csv)
    const lineAdapter = new gpf.stream.LineAdapter()
    const csvParser = new gpf.stream.csv.Parser()
    const output = new gpf.stream.WritableArray()
    return gpf.stream.pipe(input, lineAdapter, csvParser, {
      write: async data => console.log(data)
    } /* output*/)
      .then(() => output.toArray())
  })
  .then(movies => {
    const tbody = document.getElementById('movies')
    movies.forEach((movie, index) => {
      if (movie.title) {
        tags.tr({ id: index }, tags.td(movie.title)).appendTo(tbody)
      }
    })
  })
