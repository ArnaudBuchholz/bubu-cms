'use strict'

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
    alert(movies.length)
  })
