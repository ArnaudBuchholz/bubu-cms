window.suite = function () {
  'use strict'

  const suite = new window.parent.jsUnitTestSuite() // eslint-disable-line new-cap
  const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)

  suite.addTestPage(`${path}unit/unitTests.qunit.html`)

  const xhr = new window.XMLHttpRequest()
  xhr.open('GET', './integration/AllJourneys.json', false)
  xhr.send(null)
  JSON.parse(xhr.responseText).forEach(name => suite.addTestPage(`${path}integration/opaTestsComponent.qunit.html?journey=${name}`))

  return suite
}
