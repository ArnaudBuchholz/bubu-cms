import ListViewState from '../../../model/ListViewState'

QUnit.module('model/ListViewState')

QUnit.test("uses default values", function (assert: QUnit.Assert) {
  const viewState = new ListViewState()
  assert.strictEqual(viewState.name, 'name')
})
