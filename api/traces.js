'use strict'

module.exports = {

  memory: (reference = {}) => {
    const usage = process.memoryUsage()
    console.log('MEMRY'.magenta, 'Memory report @'.gray, new Date().toISOString().magenta)
    'rss,heapTotal,heapUsed,external'.split(',').forEach(type => {
      const value = usage[type]
      const last = reference[type]
      let diff
      if (last) {
        if (last >= value) {
          diff = ('-' + (last - value).toString()).green
        } else {
          diff = ('+' + (value - last).toString()).red
        }
      } else {
        diff = ''
      }
      console.log('MEMRY'.magenta, `  ${type.padEnd(9, ' ')} (bytes) :`.gray,
        value.toString().padEnd(9, ' ').white, diff)
    })
    return usage
  }

}
