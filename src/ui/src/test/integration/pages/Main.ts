import Opa5 from 'sap/ui/test/Opa5'
import { convert } from '../opaPage'

export class MainPageActions extends Opa5 {
  and: MainPageActions = this
}

export class MainPageAssertions extends Opa5 {
  and: MainPageAssertions = this

  iSeeThePage (): MainPageAssertions {
    return this.waitFor({
      id: 'page',
      success: () => Opa5.assert.ok(true, 'The main page is visible')
    }) as MainPageAssertions
  }
}

Opa5.createPageObjects({
  onTheMainPage: {
    viewName: 'view.App',
    actions: convert(MainPageActions),
    assertions: convert(MainPageAssertions)
  }
})
