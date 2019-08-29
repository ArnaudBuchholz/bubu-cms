'use strict'

require('colors')
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
      Object.keys(this._Record).forEach(staticProperty => {
        this._Record[staticProperty] = this._Record[this._Record]
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

  open () {
    if (!this.opened) {
      try {
        let dbPath
        if (path.isAbsolute(this._name)) {
            dbPath = this._name
        } else {
            dbPath = path.join(__dirname, `../db/${this._name}`)
        }
        console.log('DATAB'.magenta, 'Opening database \''.gray + dbPath.green + '\'...'.gray)
        const start = process.hrtime()
        const memoryBefore = traceMemory()
        this.opened = require(`${dbPath}/init`)(this)
          .then(() => {
            console.log('DATAB'.magenta, 'Database \''.gray + dbPath.green + '\' opened.'.gray)
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

  constructor (name) {
    this._name = name
    this._recordSet = new RecordSet(this)
    this._tagSet = new TagSet(this)
  }
}

module.exports = Database
