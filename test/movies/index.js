'use strict'

module.exports = {
  ui5: 'latest',
  port: 3000,
  types: {
    movie: {
      label: {
        type: "film", // { en: "movie", fr: "film" },
        status1: "Sortie",
        status2: "Longueur",
        "section.title": "IMDB",
        "section.OpenOnIMDB": "Ouvrir dans IMDB"
      },
      "defaultIcon": "video"

    }
  }
}