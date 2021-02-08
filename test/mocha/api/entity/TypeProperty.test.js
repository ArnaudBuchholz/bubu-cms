'use strict'

const assert = require('assert')
const TypeProperty = require('../../../../api/entity/TypeProperty')

describe('/api/entity/TypeProperty', () => {
  it('initializes with default values', () => {
    const property = new TypeProperty('test', 'name')
    assert.strictEqual(property.type, 'test')
    assert.strictEqual(property.name, 'name')
    assert.strictEqual(property.editable, 0)
    assert.strictEqual(property.regexp, '')
    assert.strictEqual(property.translations(), '')
  })

  it('initializes with a property descriptor', () => {
    const property = new TypeProperty('test', 'number', {
      regexp: '\\d+ / \\d+',
      placeholder: 'page / book'
    })
    assert.strictEqual(property.type, 'test')
    assert.strictEqual(property.name, 'number')
    assert.strictEqual(property.editable, 1)
    assert.strictEqual(property.regexp, '\\d+ / \\d+')
    assert.strictEqual(property.translations(), 'test.number.placeholder=page / book')
  })

  it('offers a complete translation system', () => {
    const property = new TypeProperty('test', 'number', {
      placeholder: 'page / book',
      placeholder_fr: 'page / classeur',
      label: 'where'
    })
    assert.strictEqual(property.type, 'test')
    assert.strictEqual(property.name, 'number')
    assert.strictEqual(property.editable, 0)
    assert.strictEqual(property.regexp, '')
    assert.strictEqual(property.translations(), 'test.number.placeholder=page / book\ntest.number.label=where')
    assert.strictEqual(property.translations('fr'), 'test.number.placeholder=page / classeur')
  })

  describe('errors', () => {
    it('expects a string for regex', () => {
      assert.throws(() => new TypeProperty('test', 'number', {
        regexp: 123
      }))
    })

    it('fails on unknown qualifier', () => {
      assert.throws(() => new TypeProperty('test', 'number', {
        any: 123
      }))
    })
  })
})
