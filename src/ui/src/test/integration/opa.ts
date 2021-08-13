import Opa5 from 'sap/ui/test/Opa5'
import { IStartup } from './arrangements/IStartup'
import { MainPageActions, MainPageAssertions } from './pages/Main'

export class Opa5Given extends Opa5 implements IStartup {
  iStartMyApp (): void {}
}

export class Opa5When extends Opa5 {
  onTheMainPage: MainPageActions = new MainPageActions()
}

export class Opa5Then extends Opa5 {
  onTheMainPage: MainPageAssertions = new MainPageAssertions()
}
