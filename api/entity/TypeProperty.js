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
    typeProperty._editable = true
    typeProperty._regexp = string(value)
    RegExp(typeProperty._regexp)
  }
}

const translatables = [
  'label',
  'placeholder'
]

class TypeProperty {
  get type () {
    return this._type
  }

  get name () {
    return this._name
  }

  get editable () {
    // Workaround until gpf-js declares boolean serial type
    return this._editable ? 1 : 0
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

  translations (lang = '') {
    const dictionary = this._translations[lang] || {}
    return Object.keys(dictionary)
      .map(key => `${this._type}.${this._name}.${key}=${dictionary[key]}`)
      .join('\n')
  }

  constructor (type, name, property) {
    this._type = type
    this._name = name
    this._editable = false
    this._regexp = ''
    this._translations = {}
    if (property) {
      Object.keys(property).forEach(qualifier => {
        try {
          const value = property[qualifier]
          const handler = qualifiers[qualifier]
          if (handler) {
            return handler(this, value)
          }
          if (translatables.every(translatable => {
            const parts = qualifier.split('_')
            if (parts[0] === translatable) {
              return this._addTranslation(translatable, value, parts[1])
            }
            return true
          })) {
            throw new Error('unknown qualifier')
          }
        } catch (e) {
          throw new Error(`Invalid type '${type}' property '${name}' qualifier '${qualifier}' : ${e.message}`)
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
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.integer }))(TypeProperty, 'editable')
attribute(new gpf.attributes.Serializable())(TypeProperty, 'regexp')

module.exports = TypeProperty
