const bubuCms = require('bubu-cms')

bubuCms
  .port(3000)
  .storage('memory')

bubuCms.type('pokemon')
  .selectOrder(0)
  .defaultIcon('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pkid}.png')
  .field('pkid', field => field.type('number'))
 