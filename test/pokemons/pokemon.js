const { readFile } = require('fs/promises')
const { join } = require('path')

async function csv (name) {
  return (await readFile(join(__dirname, name)))
    .toString()
    .split('\n')
    .slice(1)
    .map(line => line.trim())
    .filter(line => !!line)
}

module.exports = async loader => {
  loader.log('info', 'Loading pokemons...')

  const tagTypeId = (await loader.getType('$tag')).id // Never assume it is $tag
  loader.log('info', '', 'Creating pokemon types as tags...', { tagTypeId })
  const types = {}
  let nbTypeTags = 0
  for await (const record of await csv('types.csv')) {
    const [id, identifier] = record.split(',')
    types[id] =await loader.create({
      type: '$tag',
      name: identifier,
      fields: {},
      refs: {}
    })
    ++nbTypeTags
  }
  loader.log('info', `Created ${nbTypeTags} pokemon types as tags.`)

  const pokemonTypeId = (await loader.getType('pokemon')).id
  loader.log('info', '', 'Creating pokemons...', { pokemonTypeId })
  let nbPokemons = 0
  for await (const record of await csv('pokemon.csv')) {
    const [pkid, identifier, speciesId, height, weight] = record.split(',')
    await loader.create({
      type: pokemonTypeId,
      name: identifier,
      fields: {
        pkid,
        speciesId,
        height,
        weight
      },
      refs: {}
    })
    ++nbPokemons
  }
  loader.log('info', `Created ${nbPokemons} pokemons`)

  loader.log('info', 'Assigning pokemon types...')
  let nbPokemonTypes = 0
  for await (const record of await csv('pokemon_types.csv')) {
    const [pkid, typeId] = record.split(',')
    const pokemon = (await loader.search({
      paging: {
        skip: 0,
        top: 1
      },
      fields: {
        pkid
      }
    })).records[0]
    if (!pokemon.refs[tagTypeId]) {
      pokemon.refs[tagTypeId] = []
    }
    pokemon.refs[tagTypeId].push(types[typeId])
    await loader.update(pokemon)
    ++nbPokemonTypes
  }
  loader.log('info', `Assigned ${nbPokemonTypes} pokemon types`)
}
