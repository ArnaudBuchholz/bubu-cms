'use strict'

const gpf = global.gpf || require('gpf-js/source')
const sortersBySerialType = {}
const Func = Function

sortersBySerialType[gpf.serial.types.string] = (name, ascending) => `
  if (a.${name} !== b.${name}) {
        return ${ascending ? 'a' : 'b'}.${name}.localeCompare(${ascending ? 'b' : 'a'}.${name});
  }
`

sortersBySerialType[gpf.serial.types.integer] = (name, ascending) => `
  if (a.${name} !== b.${name}) {
        return ${ascending ? 'a' : 'b'}.${name} - ${ascending ? 'b' : 'a'}.${name};
  }
`

sortersBySerialType[gpf.serial.types.datetime] = (name, ascending) => `
  if (a.${name}.getTime() !== b.${name}.getTime()) {
        return ${ascending ? 'a' : 'b'}.${name}.getTime() - ${ascending ? 'b' : 'a'}.${name}.getTime();
  }
`

module.exports = (EntityClass, orderBy) => {
  const serialProps = gpf.serial.get(EntityClass)

  const propsPerName = Object.keys(serialProps).reduce((dictionary, member) => {
    const property = serialProps[member]
    dictionary[property.name] = {
      member: member,
      type: property.type
    }
    return dictionary
  }, {})

  const body = orderBy
    .toLowerCase()
    .split(',')
    .map(criteria => {
      const parts = (/(\w+) *(asc|desc)/).exec(criteria)
      const property = propsPerName[parts[1]]
      return sortersBySerialType[property.type](property.member, parts[2] !== 'desc')
    })
  body.push('return a._id.localeCompare(b._id);')
  return new Func('a', 'b', body.join('\n'))
}
