'use strict'

const assert = require('assert')
const TypeProperty = require('../../../../api/entity/TypeProperty')

describe('/core/api/entity/TypeProperty.js', () => {
  it('initializes with default values', () => {
    const property = new TypeProperty('test', 'name')
    assert.strictEqual(property.type, 'test')
    assert.strictEqual(property.name, 'name')
    assert.strictEqual(property.readOnly, 1)
  })
})
