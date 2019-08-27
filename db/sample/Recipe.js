'use strict'

const gpf = require('gpf-js')
const fs = require('fs')
const path = require('path')
// const showdown = require('showdown')
// const md = new showdown.Converter()

module.exports = db => gpf.define({
  $class: 'Recipe',
  $extend: db.Record,

  _statusState1: db.Record.StatusState.show,
  _statusState2: db.Record.StatusState.show,

  constructor: function (raw) {
    const
      calories = parseInt(raw.calories, 10)

    const portions = parseInt(raw.portions, 10)
    this._number = Math.floor(calories / portions)
    this._icon = `/images/recipe/${raw.id}.jpg`
    this._statusText1 = portions.toString()
    this._statusText2 = raw.ready + 'm'
    this.$super(raw)
  },

  getContent: function () {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, 'recipe', `${this._id}.md`), (err, content) => err
        ? reject(err)
        : resolve(content.toString())
      )
    }).then(content => this._allocateContent({
      _type: 'html',
      _data: '<h1>POUET<h1>' // md.makeHtml(content)
    }))
  }

})
