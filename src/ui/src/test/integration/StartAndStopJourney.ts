import opaTest from 'sap/ui/test/opaQunit'
import { Opa5Given, Opa5When, Opa5Then } from './opa'

QUnit.module('Start and Stop')

opaTest('Starting and shutting down the app', function (Given: Opa5Given, When: Opa5When, Then: Opa5Then) {
  Given.iStartMyApp();
  Then.onTheMainPage.iSeeThePage()
    .and.iTeardownMyApp()
})
