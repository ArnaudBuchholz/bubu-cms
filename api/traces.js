'use strict'

function toKb (value) {
  return Math.floor(value / 1024).toString()
}

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
          diff = ('-' + toKb(last - value)).green
        } else {
          diff = ('+' + toKb(value - last)).red
        }
      } else {
        diff = ''
      }
      console.log('MEMRY'.magenta, `  ${type.padEnd(9, ' ')} (KB) :`.gray,
        toKb(value).padEnd(9, ' ').white, diff)
    })
    return usage
  }

}
