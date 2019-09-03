'use strict'

module.exports = {

  memory: (reference = {}) => {
    const usage = process.memoryUsage()
    console.log('MEMRY'.magenta, 'Memory report @'.gray, new Date().toISOString().magenta)
    'rss,heapTotal,heapUsed,external'.split(',').forEach(type => {
      const value = usage[type]
      const last = reference[type]
      let label
      if (last === undefined || last >= value) {
        label = value.toString().green
      } else {
        label = value.toString().red
      }
      console.log('MEMRY'.magenta, `  ${type.padEnd(9, ' ')} (bytes) :`.gray, label)
    })
    return usage
  }

}
