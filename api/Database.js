'use strict'

require('colors')
const gpf = require('gpf-js')
const path = require('path')
const Record = require('./Record')
const RecordSet = require('./RecordSet')
const TagSet = require('./TagSet')
const traceMemory = require('./traces').memory

class Database {
  get Record () {
    if (!this._Record) {
      const database = this
      this._Record = class DBRecord extends Record {
        constructor () {
          super(database)
        }
      }
      // Forward record static properties
      Object.keys(Record).forEach(staticProperty => {
        this._Record[staticProperty] = Record[staticProperty]
      })
    }
    return this._Record
  }

  get records () {
    return this._recordSet
  }

  get tags () {
    return this._tagSet
  }

  get path () {
    return this._path
  }

  open () {
    if (!this.opened) {
      try {
        console.log('DATAB'.magenta, 'Opening database \''.gray + this.path.green + '\'...'.gray)
        const start = process.hrtime()
        const memoryBefore = traceMemory()
        this.opened = require(`${this.path}/init`)(this)
          .then(() => {
            console.log('DATAB'.magenta, 'Database \''.gray + this.path.green + '\' opened.'.gray)
            const duration = process.hrtime(start)
            console.log('DATAB'.magenta, '  Duration (ms) :'.gray, (duration[0] * 1000 + duration[1] / 1000000).toString().green)
          })
          .then(() => this.records.all())
          .then(records => console.log('DATAB'.magenta, '  Records count :'.gray, records.length.toString().green))
          .then(() => this.tags.all())
          .then(tags => console.log('DATAB'.magenta, '  Tags count    :'.gray, tags.length.toString().green))
          .then(() => traceMemory(memoryBefore))
      } catch (e) {
        console.log('DATAB'.magenta, e.toString().red)
        console.error(e)
      }
    }
    return this.opened
  }

  async getI18n (language = '') {
    console.log('DATAB'.magenta, 'Getting i18n for language \''.gray + language.green + '\'...'.gray)
    let i18nPath
    if (language) {
      i18nPath = `${this.path}/i18n_${language}.properties`
    } else {
      i18nPath = `${this.path}/i18n.properties`
    }
    const gpfFileStorage = gpf.fs.getFileStorage()
    const info = await gpfFileStorage.getInfo(i18nPath)
    if (info.type !== gpf.fs.types.file) {
      return null
    }
    const i18nFile = await gpfFileStorage.openTextStream(i18nPath, gpf.fs.openFor.reading)
    const output = new gpf.stream.WritableString()
    return gpf.stream.pipe(i18nFile, output)
      .then(() => output.toString())
      .then(content => {
        const i18nKeys = this._i18nKeys[language] || this._i18nKeys['']
        if (i18nKeys) {
          return content + '\n\n# Dynamic keys\n' +
            Object.keys(i18nKeys).map(key => `${key}=${i18nKeys[key]}`).join('\n')
        }
        return content
      })
  }

  addI18nKey (key, value, language = '') {
    if (!this._i18nKeys) {
      this._i18nKeys = {}
    }
    if (!Object.prototype.hasOwnProperty.call(this._i18nKeys, language)) {
      this._i18nKeys[language] = {}
    }
    this._i18nKeys[language][key] = value
  }

  constructor (name) {
    this._name = name
    if (path.isAbsolute(name)) {
      this._path = name
    } else {
      this._path = path.join(__dirname, `../db/${name}`)
    }
    this._recordSet = new RecordSet(this)
    this._tagSet = new TagSet(this)
  }
}

module.exports = Database
