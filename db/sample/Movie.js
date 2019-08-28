
module.exports = db => {
  class Movie extends db.Record {
    constructor (raw) {
      super()
      this._name = raw.title
    }
  }

  Object.assign(Movie.prototype, {

    _icon: 'sap-icon://video'

  })

  return Movie
}
