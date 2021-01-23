'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('reserve-odata/attributes/Key')

const string = value => {
  if (typeof value !== 'string') {
    throw new Error('expected string')
  }
  return value
}

const qualifiers = {
  regexp: (typeProperty, value) => {
    typeProperty._regexp = string(value)
    new RegExp(typeProperty._regexp)
  }
}

const translatables = ['label', 'placeholder']

class TypeProperty {
  get type () {
    return this._type
  }

  get name () {
    return this._name
  }

  get readOnly () {
    // Workaround until gpf-js declares boolean serial type
    return this._readOnly ? 1 : 0
  }

  get regexp () {
    return this._regexp
  }

  _addTranslation (key, label, lang = '') {
    if (!this._translations[lang]) {
      this._translations[lang] = {}
    }
    this._translations[lang][key] = label
  }

  constructor (type, name, property) {
    this._type = type
    this._name = name
    this._readOnly = true
    this._regexp = ''
    this._translations = {}
    if (this.property) {
      Object.keys(property).forEach(qualifier => {
        try {
          const value = property[qualifier]
          const handler = qualifiers[name]
          if (handler) {
            return handler(this, value)
          }
          translatables.forEach(translatable => {
            if (qualifier === translatable) {
              return this._addTranslation(`${type}.${name}.${translatable}`, value)
            }
            if (qualifier.startsWith(`${translatable}:`)) {
              return this._addTranslation(`${type}.${name}.${translatable}`, value, qualifier.substring(1 + translatable.length))
            }
            throw new Error('unknown')
          })
        } catch (e) {
          throw new Error(`Invalid type '${type}' property '${name}' qualifier `${qualifier}` : ${e.message}`)
        }
      })
    }
  }
}

attribute(new gpf.attributes.Serializable())(TypeProperty, 'type')
attribute(new Key())(TypeProperty, 'type')
attribute(new gpf.attributes.Serializable())(TypeProperty, 'name')
attribute(new Key())(TypeProperty, 'name')
// Workaround until gpf-js declares boolean serial type
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.integer }))(TypeProperty, 'readOnly')
attribute(new gpf.attributes.Serializable())(TypeProperty, 'regexp')

module.exports = TypeProperty
