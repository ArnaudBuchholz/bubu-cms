'use strict'

const byType = {
  number: (value1, value2) => value1 - value2,
  date: (value1, value2) => value1 - value2,
  default: (value1, value2) => (value1 || '').toString().localeCompare((value2 || '').toString())
}

function getType (typeofValue1, value1) {
  if (typeofValue1 === 'object') {
    if (value1 instanceof Date) {
      return 'date'
    }
  }
  if (Object.prototype.hasOwnProperty.call(byType, typeofValue1)) {
    return typeofValue1
  }
  return 'default'
}

module.exports = (value1, value2) => {
  if (value1 === value2) {
    return 0
  }
  const typeofValue1 = typeof value1
  const type = typeofValue1 === typeof value2 // eslint-disable-line valid-typeof
    ? getType(typeofValue1, value1)
    : 'default'
  return byType[type](value1, value2)
}
