'use strict'

require('colors')
const gpf = require('gpf-js')
const path = require('path')
const Record = require('./Record')
const RecordSet = require('./RecordSet')
const TagSet = require('./TagSet')
const traceMemory = require('./traces').memory

const gpfFileStorage = gpf.fs.getFileStorage()
const forReading = gpf.fs.openFor.reading
const forAppending = gpf.fs.openFor.appending

class Database {
  get Record () {
    if (!this._Record) {
      const database = this
      this._Record = class DBRecord extends Record {
        constructor () {
          super(database)
        }

        async dbSaveField (fieldName, value) {
          const insertHeader = !database._hasCSV(fieldName)
          const filePath = path.join(database.path, `${fieldName}.csv`)
          const csvFile = await gpfFileStorage.openTextStream(filePath, forAppending)
          if (insertHeader) {
            await csvFile.write('id;value;timestamp\n')
          }
          await csvFile.write(`${this._id};${value};${new Date().toISOString()}\n`)
          return gpfFileStorage.close(csvFile)
        }

        async dbSave (values) {
          for await (const fieldName of Object.keys(values)) {
            let value = values[fieldName]
            this[`_${fieldName}`] = value
            if (value instanceof Date) {
              value = value.toISOString()
            }
            await this.dbSaveField(fieldName, value)
          }
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

  async _hasCSV (fileName) {
    const filePath = path.join(this.path, `${fileName}.csv`)
    const fileInfo = await gpfFileStorage.getInfo(filePath)
    return fileInfo.type === gpf.fs.types.file
  }

  async _readCSV (fileName, output) {
    if (!await this._hasCSV(fileName)) {
      return Promise.resolve()
    }
    const filePath = path.join(this._path, `${fileName}.csv`)
    const csvFile = await gpfFileStorage.openTextStream(filePath, forReading)
    const lineAdapter = new gpf.stream.LineAdapter()
    const csvParser = new gpf.stream.csv.Parser()
    return gpf.stream.pipe(csvFile, lineAdapter, csvParser, output)
  }

  open () {
    if (!this.opened) {
      try {
        console.log('DATAB'.magenta, 'Opening database \''.gray + this.path.green + '\'...'.gray)
        const start = process.hrtime()
        const memoryBefore = traceMemory()
        this.opened = require(`${this.path}/init`)(this)
          .then(() => {
            console.log('DATAB'.magenta, 'Loading ratings...'.gray)
            return this._readCSV('rating', {
              write: async rating => {
                const record = await this.records.byId(rating.id)
                if (record) {
                  record._rating = record.value
                }
              }
            })
          })
          .then(() => {
            console.log('DATAB'.magenta, 'Ratings loaded.'.green)
            console.log('DATAB'.magenta, 'Loading touch timestamps...'.gray)
            return this._readCSV('touched', {
              write: async touched => {
                const record = await this.records.byId(rating.id)
                if (record) {
                  record._touched = new Date(record.value)
                }
              }
            })
          })
          .then(() => {
            console.log('DATAB'.magenta, 'Touch timestamps loaded.'.green)
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

  async getFragment (type) {
    console.log('DATAB'.magenta, 'Getting fragment for type \''.gray + type.green + '\'...'.gray)
    const fragmentPath = `${this.path}/${type}.fragment.xml`
    const gpfFileStorage = gpf.fs.getFileStorage()
    const info = await gpfFileStorage.getInfo(fragmentPath)
    if (info.type !== gpf.fs.types.file) {
      return null
    }
    const fragmentFile = await gpfFileStorage.openTextStream(fragmentPath, gpf.fs.openFor.reading)
    const output = new gpf.stream.WritableString()
    return gpf.stream.pipe(fragmentFile, output)
      .then(() => output.toString())
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
