window.suite = function () {
  'use strict'

  const suite = new parent.jsUnitTestSuite()
  const path = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1)

  suite.addTestPage(`${path}unit/unitTests.qunit.html`)

  const xhr = new XMLHttpRequest()
  xhr.open('GET', './integration/AllJourneys.json', false)
  xhr.send(null)
  JSON.parse(xhr.responseText).forEach(name => suite.addTestPage(`${path}integration/opaTestsComponent.qunit.html?journey=${name}`))

  return suite
}
