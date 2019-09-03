
module.exports = db => {
  class Movie extends db.Record {
    constructor (raw) {
      super()
      this._name = raw.title
      this._id = this._buildId(raw.imdbid)
      this._statusText1 = raw.year
      this._statusText2 = `${raw.book} / ${raw.page}`
      raw.genre.split(' ')
        .forEach(genre => this.addTag(genre))
      raw.actors.split(';')
        .map(actor => actor.toLowerCase().replace(/ /g, '_'))
        .forEach(actor => actor.includes('=')
          ? this.addTag(actor.split('=')[0])
          : this.addTag(actor)
        )
    }
  }

  Object.assign(Movie.prototype, {

    _icon: 'sap-icon://video'

  })

  return Movie
}
