'use strict'

const app = require('../app')
const debug = require('debug')('bubu-cms')
const http = require('http')
const config = require('../config')
const port = config.httpPort || 3000

app.set('port', port)

const server = http.createServer(app)

server.listen(port)

server.on('error', error => {
  if (error.syscall !== 'listen') {
    throw error
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)

    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)

    default:
      throw error
  }
})

server.on('listening', () => {
  var addr = server.address()
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
})
