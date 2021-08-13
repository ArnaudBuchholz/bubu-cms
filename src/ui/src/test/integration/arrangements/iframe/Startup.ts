import Opa5 from 'sap/ui/test/Opa5';
import { ApplicationStartupOptions, IStartup } from '../IStartup'

/**
 * @namespace bubu-cms.test.integration.arrangements.iframe
 */
export default class Startup extends Opa5 implements IStartup {

  iStartMyApp (options: ApplicationStartupOptions = {}) {
    const delay: number = options.serverDelay ?? 1
    const hash: string = options.hash ?? ''
    let finalHash: string
    if (hash.length > 0) {
      finalHash = '#/' + hash
    } else {
      finalHash = ''
    }
    return this.iStartMyAppInAFrame(`../../index.html?serverDelay=${delay}${finalHash}`)
  }

}
