const proxyquire = require('proxyquire').noCallThru()
proxyquire('./index', {
  'bubu-cms': {
    test: function () {
      console.log('OK')
    }
  }
})
