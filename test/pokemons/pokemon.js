const { readFile } = require('fs/promises')

async function csv (name) {
  return (await readFile(name))
    .toString()
    .split('\n')
    .slice(1)
    .map(line => line.trim())
    .filter(line => !!line)
}

module.exports = async loader => {
  loader.log('info', 'Loading pokemons...')
  loader.log('info', 'Creating pokemon types as tags...')
  const types = {}
  for await (const record of await csv('./types.csv')) {
    const [id, identifier] = record.split(',')
    const tagId = await loader.create({
      type: '$tag',
      name: identifier,
      fields: {},
      refs: {}
    })
    loader.log('info', `${tagId} : ${identifier}`)
    types[id] = tagId
  }
  const pokemonTypes = {}
  const tagTypeId = (await loader.getType('$tag')).id // Never assume it is $tag
  loader.log('info', '', 'Loading pokemon types...', { tagTypeId })
  for await (const record of await csv('./pokemon_types.csv')) {
    const [id, typeId] = record.split(',')
    if (pokemonTypes[id] === undefined) {
      pokemonTypes[id] = []
    }
    pokemonTypes[id].push(types[typeId])
  }
  const pokemonTypeId = (await loader.getType('pokemon')).id
  loader.log('info', '', 'Creating pokemons...', { pokemonTypeId })
  for await (const record of await csv('./pokemon.csv')) {
    const [pkid, identifier, speciesId, height, weight] = record.split(',')
    const pokemonId = await loader.create({
      type: pokemonTypeId,
      name: identifier,
      fields: {
        pkid,
        speciesId,
        height,
        weight
      },
      refs: {
        [tagTypeId]: pokemonTypes[pkid]
      }
    })
    loader.log('info', `${pokemonId} : ${identifier}`)
  }
}
