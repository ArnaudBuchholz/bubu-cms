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
  const tags = await csv('./types.csv')
  const types = {}
  for await (const tag of tags) {
    const [id, identifier] = tag.split(',')
    const tagId = await loader.create({
      type: '$tag',
      name: identifier,
      fields: {},
      refs: {}
    })
    loader.log('info', `${tagId} : ${identifier}`)
    types[id] = tagId
  }
}
