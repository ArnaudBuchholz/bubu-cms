(function () {
  'use strict'

  var loading = document.body.appendChild(document.createElement('div'))
  loading.innerHTML = 'Loading...'

  var count = 0
  var _XMLHttpRequest = window.XMLHttpRequest
  window.XMLHttpRequest = function () {
    var xhr = new _XMLHttpRequest()
    xhr.open = function (method, url) {
      loading.innerHTML = 'Loading' + new Array(1 + count % 3).join('.')
      ++count
      return _XMLHttpRequest.prototype.open.apply(this, arguments)
    }
    return xhr
  }
}())
