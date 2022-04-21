const cms = require('bubu-cms')
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

async function init () {
  cms.port(3000)

  await cms.storage('memory')

  const pokemonTypeId = await cms.type('pokemon')
    .selectOrder(0)
    .defaultIcon(record => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${records.fields.pkid}.png`)
    .field('pkid', { type: 'number' })
    .field('speciesId', { type: 'number' })
    .field('height', { type: 'number' })
    .field('weight', { type: 'number' })
    .upsert()

  const moveTypeId = await cms.type('move')
    .defaultIcon('sap-icon://journey-depart')
    .field('mvid', { type: 'number' })
    .field('power', { type: 'number' })
    .field('pp', { type: 'number' })
    .field('accuracy', { type: 'number' })
    .upsert()

  const pokemonMoveTypeId = await cms.type('pokemon_move')
    .field('level', { type: 'number' })
    .upsert()

  cms.log('info', 'Loading pokemons...')

  cms.log('info', 'Creating pokemon types as tags...')
  const types = {}
  let nbTypeTags = 0
  for await (const record of await csv('types.csv')) {
    const [id, identifier] = record.split(',')
    types[id] = await cms.upsert({
      type: '$tag',
      name: identifier,
      fields: {},
      refs: {}
    })
    ++nbTypeTags
  }
  cms.log('info', `Created ${nbTypeTags} pokemon types as tags.`)

  cms.log('info', '', 'Creating pokemons...', { pokemonTypeId })
  let nbPokemons = 0
  for await (const record of await csv('pokemon.csv')) {
    const [pkid, identifier, speciesId, height, weight] = record.split(',')
    await cms.upsert({
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
  cms.log('info', `Created ${nbPokemons} pokemons.`)

  cms.log('info', 'Assigning pokemon types...')
  let nbPokemonTypes = 0
  for await (const record of await csv('pokemon_types.csv')) {
    const [pkid, typeId] = record.split(',')
    const pokemon = (await cms.search({
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
    await cms.update(pokemon)
    ++nbPokemonTypes
  }
  cms.log('info', `Assigned ${nbPokemonTypes} pokemon types.`)

  cms.log('info', '', 'Creating pokemon moves...', { moveTypeId })
  let nbMoves = 0
  for await (const record of await csv('moves.csv')) {
    const [mvid, identifier,, typeId, power, pp, accuracy] = record.split(',')
    await cms.create({
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
  cms.log('info', `Created ${nbMoves} pokemon moves.`)

  cms.log('info', '', 'Associating pokemon moves...', { pokemonMoveTypeId })
  let nbPokemonMoves = 0
  const moves = await csv('pokemon_moves.csv')
  const start = new Date()
  let lastPokemon
  let lastUpdate = new Date()
  for await (const record of moves) {
    const [pkid, version, mvid,, level] = record.split(',')
    if (version !== '18') {
      continue
    }
    if (!lastPokemon || pkid !== lastPokemon.fields.pkid) {
      if (lastPokemon) {
        await cms.update(lastPokemon)
      }
      lastPokemon = (await cms.search({
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
    const move = (await cms.search({
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
    const pokemonMoveId = await cms.create({
      type: pokemonMoveTypeId,
      name: `${lastPokemon.name} -> ${move.name}`,
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
      cms.log('info', `Associating pokemon moves (${Math.floor(100 * nbPokemonMoves / moves.length)}% ${format(elapsed)} / ${format(elapsed * moves.length / nbPokemonMoves)})...`)
    }
  }
  cms.log('info', `Associated ${nbPokemonMoves} pokemon moves.`)
}