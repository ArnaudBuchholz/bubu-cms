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

  loader.log('info', 'Creating pokemon types as tags...')
  const types = {}
  let nbTypeTags = 0
  for await (const record of await csv('types.csv')) {
    const [id, identifier] = record.split(',')
    types[id] = await loader.create({
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
    if (!pokemon.refs.$tag) {
      pokemon.refs.$tag = []
    }
    pokemon.refs.$tag.push(types[typeId])
    await loader.update(pokemon)
    ++nbPokemonTypes
  }
  loader.log('info', `Assigned ${nbPokemonTypes} pokemon types`)

  const moveTypeId = (await loader.getType('move')).id
  loader.log('info', '', 'Creating pokemon moves...', { moveTypeId })
  let nbMoves = 0
  for await (const record of await csv('moves.csv')) {
    const [mvid, identifier,, typeId, power, pp, accuracy] = record.split(',')
    await loader.create({
      type: moveTypeId,
      name: identifier,
      fields: {
        mvid,
        power,
        pp,
        accuracy
      },
      refs: {
        $tag: [types[typeId]]
      }
    })
    ++nbMoves
  }
  loader.log('info', `Created ${nbMoves} pokemon moves`)

  const pokemonMoveTypeId = (await loader.getType('pokemon_move')).id
  loader.log('info', '', 'Associating pokemon moves...', { pokemonMoveTypeId })
  let nbPokemonMoves = 0
  const moves = await csv('pokemon_moves.csv')
  const start = new Date()
  let lastPokemon
  let lastUpdate = new Date()
  for await (const record of moves) {
    const [pkid,, mvid,, level] = record.split(',')
    if (!lastPokemon || pkid !== lastPokemon.fields.pkid) {
      if (lastPokemon) {
        await loader.update(lastPokemon)
      }
      lastPokemon = (await loader.search({
        paging: {
          skip: 0,
          top: 1
        },
        fields: {
          pkid
        },
        refs: {
          $type: [pokemonTypeId]
        }
      })).records[0]
      if (!lastPokemon.refs[pokemonMoveTypeId]) {
        lastPokemon.refs[pokemonMoveTypeId] = []
      }
      if (!lastPokemon.refs[moveTypeId]) {
        lastPokemon.refs[moveTypeId] = []
      }
    }
    const move = (await loader.search({
      paging: {
        skip: 0,
        top: 1
      },
      fields: {
        mvid
      },
      refs: {
        $type: [moveTypeId]
      }
    })).records[0]
    const pokemonMoveId = await loader.create({
      type: pokemonMoveTypeId,
      name: '123', // move.name,
      fields: {
        level
      },
      refs: {
        $tag: move.refs.$tag,
        [moveTypeId]: [move.id],
        [pokemonTypeId]: [lastPokemon.id]
      }
    })
    lastPokemon.refs[pokemonMoveTypeId].push(pokemonMoveId)
    lastPokemon.refs[moveTypeId].push(move.id)
    ++nbPokemonMoves
    const now = new Date()
    const elapsedSinceLastUpdate = now - lastUpdate
    if (elapsedSinceLastUpdate > 5000 && Math.floor(elapsedSinceLastUpdate % 1000) % 5 === 0) {
      lastUpdate = now
      const elapsed = now - start
      const format = ms => {
        const m = Math.floor(ms / 60000)
        const s = Math.floor((ms - m * 60000) / 1000)
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      }
      loader.log('info', `Associating pokemon moves (${Math.floor(100 * nbPokemonMoves / moves.length)}% ${format(elapsed)} / ${format(elapsed * moves.length / nbPokemonMoves)})...`)
    }
  }
  loader.log('info', `Associated ${nbPokemonMoves} pokemon moves`)
}
