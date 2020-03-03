(function () {
  'use strict'

  const loading = document.body.appendChild(document.createElement('div'))
  loading.setAttribute('style', 'z-index: 999; position: absolute; left: 2rem; top: 2rem; font-size: 5rem; opacity: .5;')

  const steps = [
      '&#9625;',
      '&#9627;',
      '&#9628;',
      '&#9631;',
      '&#9626;',
      '&#9630;'
  ]

  let count = 0
  function animate () {
    if (count !== -1) {
      loading.innerHTML = steps[count]
      count = (count + 1) % steps.length
    }
  }

  function onError () {
    loading.innerHTML = '&#9888;'
    count = -1
  }

  window.addEventListener('error', onError)

  const _XMLHttpRequest = window.XMLHttpRequest
  window.XMLHttpRequest = function () {
    const xhr = new _XMLHttpRequest()
    xhr.open = function (method, url) {
      animate()
      return _XMLHttpRequest.prototype.open.apply(this, arguments)
    }
    return xhr
  }

  const headObserver = new MutationObserver(animate)
  headObserver.observe(document.querySelector("head"), {
    childList: true
  });

  const bodyObserver = new MutationObserver(function () {
    if (document.body.dataset.loading === 'off') {
      loading.setAttribute('style', 'display: none;')
      window.XMLHttpRequest = _XMLHttpRequest
      headObserver.disconnect()
      bodyObserver.disconnect()
      window.removeEventListener('error', onError)
    }
  })
  bodyObserver.observe(document.body, {
    attributes: true
  })

  animate()
}())
